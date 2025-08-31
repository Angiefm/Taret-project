import { Component, ChangeDetectionStrategy } from '@angular/core'; // aqui importo changeDetectionStrategy porque lo voy a usar

@Component({
  selector: 'app-filters',
  imports: [],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // aqui pongo onpush para optimizar la detección de cambios
})
export class Filters {

}
