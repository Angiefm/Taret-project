import { Component, ChangeDetectionStrategy } from '@angular/core'; // importo ChangeDetectionStrategy

@Component({
  selector: 'app-search-form',
  imports: [],
  templateUrl: './search-form.html',
  styleUrl: './search-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // aqui aplico OnPush
})
export class SearchForm {

}
