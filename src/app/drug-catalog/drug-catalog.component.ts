import { Component, OnInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { ApiService } from '../services/api.service';
import { CommonService } from '../services/common.service';
import { DrugService } from '../services/drug.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-drug-catalog',
  templateUrl: './drug-catalog.component.html',
  styleUrls: ['./drug-catalog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DrugCatalogComponent implements OnInit {
  userType:string = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalItems: number;

  @ViewChild('searchEle', {static: false}) searchEle: ElementRef;
  id='';
  index:number;
  search = '';
  status = '';
  dataLoader = false;
  drugs = [];

  @ViewChild('ngaddform', {static: false}) ngaddform: NgForm;
  addForm: FormGroup;
  addFormLoader = false;

  itemTypes = ['CAPSULE', 'CREAM', 'DROPS', 'FOAM', 'GEL', 'INHALER', 'INJECTION', 'LOTION', 'MOUTHWASH', 'OINTMENT', 'POWDER', 'SHAMPOO', 'SPRAY', 'SYRINGE', 'SYRUP', 'TABLET', 'TOOTHPASTE', 'OTHER', 'GARGLE', 'SUSPENSION', 'SERUM', 'GLOBULES', 'SOLUTION', 'OTHER'];
  itemUnits = ['gm','mcg','mg','mg SR','million spores','ml','IU','units','%','% w/v','% w/w','NA'];

  @ViewChild('ngupdateform', {static: false}) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormLoader = false;

  updateDetail = {
    "id":"",
    "item_name": "",
    "item_type": "",
    "item_strength": "",
    "item_unit": "",
    "item_instruction": ""
  };

  constructor(
	private translate: TranslateService,
    private title: Title,
    private drugService: DrugService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService
  ) {
	const lang = localStorage.getItem('lang') ? localStorage.getItem('lang') : this.commonService.lang;
    translate.setDefaultLang(lang);
    translate.use(lang);
    this.title.setTitle('Drug Catalog');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        /* const allowedUserTypes = ['Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        } */
      }
    );
    this.addForm = this.formBuilder.group({
      item_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      item_type: ['', [
        Validators.required
      ]],
      item_strength: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(6)
      ]],
      item_unit: ['', [
        Validators.required
      ]],
      item_instruction: [],
      status: ['Active', [
        Validators.required
      ]]
    });
    this.updateForm = this.formBuilder.group({
      item_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      item_type: ['', [
        Validators.required
      ]],
      item_strength: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(6)
      ]],
      item_unit: ['', [
        Validators.required
      ]],
      item_instruction: [],
      status: ['Active', [
        Validators.required
      ]]
    });
    this.getTotalItems();
  }

  ngOnInit() {
    this.commonService.localeEvent.subscribe(locale => this.translate.use(locale));
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchEle.nativeElement, 'keyup').pipe(
      map((event: any) => {return event.target.value;}), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      if (this.search.length > 1) {
        this.getTotalItems();
      }
    });
  }

  getTotalItems() {
    this.drugService.total({search: this.search, status: this.status}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        if (this.totalItems > 0) {
          this.getItems();
        }
      }
    );
  }

  getItems() {
    this.dataLoader = true;
    let params = {
      search: this.search,
      status: this.status,
      limit: this.itemsPerPage,
      page: this.currentPage,
      ob_key: 'created_date',
      ob_value: 'DESC'
    };
    this.drugService.get(params).subscribe(
      (response: any) => {
        this.drugs = response.data;
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; },
    )
  }

  openAddForm() {
    this.ngaddform.resetForm();
    this.addForm.reset();
    this.addForm.patchValue({
      item_type: '',
      item_unit: '',
      status: 'Active'
    });
    this.modalService.open_modal("#addFormModal");
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("item_name", this.addForm.value.item_name);
      postData.append("item_type", this.addForm.value.item_type);
      postData.append("item_strength", this.addForm.value.item_strength);
      postData.append("item_unit", this.addForm.value.item_unit);
      postData.append("item_instruction", this.addForm.value.item_instruction);
      postData.append("status", this.addForm.value.status);
      this.addFormLoader = true;
      this.drugService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal("#addFormModal");
            this.getTotalItems();
          }
          this.addFormLoader = false;
        },
        (error) => { this.addFormLoader = false; }
      );
    }
  }

  openUpdateForm(id:string, i:number) {
    this.id = id;
    this.index = i;
    let data = this.drugs[i];
    this.updateForm.patchValue({
      item_name: data.item_name,
      item_type: data.item_type,
      item_strength: data.item_strength,
      item_unit: data.item_unit,
      item_instruction: data.item_instruction,
      status: data.status
    })
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let postData = {
        token: this.commonService.getUserData("token"),
        item_name: this.updateForm.value.item_name,
        item_type: this.updateForm.value.item_type,
        item_strength: this.updateForm.value.item_strength,
        item_unit: this.updateForm.value.item_unit,
        item_instruction: this.updateForm.value.item_instruction,
        status: this.updateForm.value.status
      }
      this.updateFormLoader = true;
      this.drugService.update(this.id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.drugs[this.index] = {
              item_name: this.updateForm.value.item_name,
              item_type: this.updateForm.value.item_type,
              item_strength: this.updateForm.value.item_strength,
              item_unit: this.updateForm.value.item_unit,
              item_instruction: this.updateForm.value.item_instruction,
              status: this.updateForm.value.status
            };
            this.modalService.close_modal('#updateFormModal');
          }
          this.updateFormLoader = false;
        },
        (error) => { this.updateFormLoader = false; }
      );
    }
  }

  deleteItem(prescription_id:string, i:number) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.dataLoader = true;
        this.drugService.delete(prescription_id).subscribe(
          (response: any) => {
            if (response.status) {
              this.getItems();
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; }
        )
      }
    });
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getItems();
  }

  clearSearch() {
    this.searchEle.nativeElement.value = '';
    this.search = '';
    this.getTotalItems();
  }

}
