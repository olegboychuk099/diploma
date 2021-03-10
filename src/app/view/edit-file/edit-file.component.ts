import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FileSocketService} from '../../services/file-socket.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {FileService} from '../../services/file.service';
import {IFullFileModel} from '../../models/file.model';
import {ToastrService} from 'ngx-toastr';
import {CodeModel} from '@ngstack/code-editor';

@Component({
  selector: 'app-edit-file',
  templateUrl: './edit-file.component.html',
  styleUrls: ['./edit-file.component.scss']
})
export class EditFileComponent implements OnInit, OnDestroy {
  private docSu$: Subscription;
  private fileId: string;
  private inviteLink: string;
  public file: IFullFileModel = {data: '', name: ''};
  theme = 'vs-dark';

  codeModel: CodeModel = {
    language: 'typescript',
    uri: 'main.json',
    value: this.file.data
  };

  options = {
    contextmenu: true,
    minimap: {
      enabled: true
    }
  };

  onCodeChanged(value): void {
    this.file.data = value;
  }

  constructor(private fileSocketService: FileSocketService,
              private fileService: FileService,
              private route: ActivatedRoute,
              private router: Router,
              private toastr: ToastrService) {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('file_id')) {
        this.fileId = paramMap.get('file_id');
        this.fileService.getUserFileById(this.fileId).subscribe(res => {
          this.file = res;
          this.codeModel.value = this.file.data;
          this.addNewFile();
        }, error => {
          this.toastr.error(error.error.message, 'ERROR!');
          this.router.navigate(['/my-files']);
        });
      }
      if (paramMap.has('invite_link')) {
        this.inviteLink = paramMap.get('invite_link');
        this.fileService.getFileByLink(this.inviteLink).subscribe(res => {
          this.fileId = res.id;
          this.codeModel.value = this.file.data;
          this.goToChat();
        }, error => {
          this.toastr.error(error.error.message, 'ERROR!');
          this.router.navigate(['/my-files']);
        });
      }
    });
  }

  ngOnInit(): void {
    this.docSu$ = this.fileSocketService.currentFile.subscribe(file => {
      if (file) {
        this.file = file;
      }
    });
  }

  ngOnDestroy(): void {
    this.docSu$.unsubscribe();
  }

  editDoc(): void {
    this.fileSocketService.editFile(this.file);
  }

  addNewFile(): void {
    this.fileSocketService.newFile(this.file);
  }

  goToChat(): void {
    this.fileSocketService.getFile(this.fileId);
  }

  copyInputMessage(val: string): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.toastr.success('Copied');
  }

  save(): void {
    this.fileService.saveFileChanges(this.file).subscribe(res => {
      this.toastr.success('File changes saved');
    }, error => {
      this.toastr.error(error.error.message, 'ERROR!');
    });
  }

  download(): void {
    this.toastr.success('Downloaded');
  }
}
