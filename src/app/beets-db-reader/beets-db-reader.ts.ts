import { Injectable, signal } from '@angular/core';
import initSqlJs from 'sql.js';
import { SqlJsStatic, Database } from 'sql.js';

@Injectable({
  providedIn: 'root',
})
export class BeetsDbReader {
  SQL = signal<SqlJsStatic | undefined>(undefined);

  constructor() {
    initSqlJs({
      locateFile: () => './assets/sql-wasm.wasm',
    }).then(this.SQL.set);
  }

  async openFile(file: File): Promise<Database> {
    const SQL = this.SQL()!;
    const buf = await file.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(buf));
    return db;
  }

  async readAlbumsFromDbFile(file: File): Promise<Set<string>> {
    const db = await this.openFile(file);

    const stmt = db.prepare('SELECT mb_releasegroupid as album FROM albums');
    const result = new Set<string>();
    while (stmt.step()) {
      const album = stmt.getAsObject()['album'];
      if (album) result.add(album as string);
    }
    return result;
  }
}
