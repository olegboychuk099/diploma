import {Component, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {IFileModel, IFullFileModel} from '../../models/file.model';
import {FileService} from '../../services/file.service';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-my-files',
  templateUrl: './my-files.component.html',
  styleUrls: ['./my-files.component.scss']
})
export class MyFilesComponent implements OnInit {

  constructor(private fileService: FileService,
              private router: Router,
              private toastr: ToastrService) {
  }

  files: Array<IFullFileModel> = [];

  ngOnInit(): void {
    this.fileService.getAllUserFiles().subscribe(res => {
      res.forEach(el => {
        el.progress = 100;
      });
      this.files = res;
    });
  }

  onFileDropped($event): void {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(files): void {
    this.prepareFilesList(files);
  }

  deleteFile(index: any): void {
    const id = this.files[index.previousIndex].id;
    this.fileService.deleteFile(id).subscribe(res => {
      this.files.splice(index.previousIndex, 1);
      this.toastr.success('File deleted', 'Done!');
    }, error => {
      this.toastr.error(error.error.message, 'ERROR!');
    });
  }

  editFile($event: CdkDragDrop<any>): void {
    this.router.navigate(['/edit-file', this.files[$event.previousIndex].id]);
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }

  uploadFilesSimulator(index: number): void {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  prepareFilesList(files: Array<any>): void {
    for (const item of files) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const newFile = {
          invite_link: Math.random().toString(36).substr(2, 9),
          name: item.name,
          data: evt.target.result,
        } as IFileModel;
        this.fileService.addFile(newFile).subscribe(res => {
          res[0].progress = 0;
          this.files.push(res[0]);
        }, error => {
          this.toastr.error('Can`t add this type of file', 'ERROR!');
        });
      };
      reader.readAsText(item);
    }
    this.uploadFilesSimulator(0);
  }

}
