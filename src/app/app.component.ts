import { Component } from '@angular/core';
import { BehaviorSubject, takeWhile, tap, timer } from 'rxjs';

interface MoleTile {
  id: number;
  isActive: boolean;
}

const GAME_TIME_LIMIT = 10;
const NUMBER_OF_TILES = 9;
const initialBoard = Array.from({length: NUMBER_OF_TILES}, (_, i) => i).map(index => ({id: index, isActive: false}));

@Component({
  template: `
    <h1>Whack-a-mole</h1>

    <span>Timer: {{ timeCounter }}</span><span>Score: {{ score }}</span>
    <br>
    <button (click)="startGame()" [disabled]="isGameStarted">Start game</button>

    <div class="game-board">
      <div
        class="tile"
        *ngFor="let tile of board$$ | async"
        [ngClass]="{'active': tile.isActive}"
        (mouseenter)="whackAMole(tile)"
      >
      </div>
    </div>
  `,
  selector: 'app-root',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  timeCounter = 0;
  score = 0;
  isGameStarted = false;

  board$$: BehaviorSubject<MoleTile[]> = new BehaviorSubject<MoleTile[]>(structuredClone(initialBoard));
  gameTimer = timer(0, 1000).pipe(
    takeWhile(time => time < GAME_TIME_LIMIT),
    tap(() => {
      const generatedNumber = this.generateNumber();
      const newBoard = structuredClone(initialBoard);
      newBoard[generatedNumber].isActive = true;
      this.board$$.next(newBoard);
    })
  );

  startGame() {
    this.timeCounter = GAME_TIME_LIMIT;
    this.score = 0;
    this.gameTimer.subscribe({
        next: () => {
          if (!this.isGameStarted) {
            this.isGameStarted = true;
          }
          this.timeCounter = this.timeCounter - 1;
        },
        complete: () => {
          this.isGameStarted = false;
          this.board$$.next(structuredClone(initialBoard));
          alert(`Your score: ${this.score}`);
        }
      }
    )
  }

  generateNumber(): number {
    const min = 0;
    const max = NUMBER_OF_TILES - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  whackAMole(tile: MoleTile) {
    if (tile.isActive) {
      const newBoard = structuredClone(initialBoard);
      newBoard[tile.id].isActive = false;
      this.board$$.next(newBoard);
      this.score = this.score + 1;
    }
  }
}
