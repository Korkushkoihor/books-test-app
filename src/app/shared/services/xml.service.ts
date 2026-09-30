import { Injectable } from '@angular/core';
import { Book } from '../types';

@Injectable({
  providedIn: 'root',
})
export class XmlService {

  public convertToXml(data: Book[]): string {
    const xmlBooks = data.map((book) => `
      <book>
        <id>${this.escapeXml(book.id)}</id>
        <title>${this.escapeXml(book.title)}</title>
        <pages>${this.escapeXml(book.pages)}</pages>
        <author>${this.escapeXml(book.author)}</author>
      </book>
    `).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${xmlBooks}\n</root>`;

    this.downloadXml(xml);
    return xml;
  }

  public parseXml(xml: string): Book[] {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    if (document.querySelector('parsererror')) {
      throw new Error('The selected file is not valid XML.');
    }

    const root = document.documentElement;
    if (!root || !['root', 'books'].includes(root.tagName.toLowerCase())) {
      throw new Error('The XML must have a <root> or <books> element.');
    }

    const bookElements = Array.from(root.children).filter(
      (element) => element.tagName.toLowerCase() === 'book'
    );
    if (bookElements.length === 0) {
      throw new Error('The XML file does not contain any books.');
    }

    return bookElements.map((element, index) => {
      const readField = (field: string): string =>
        Array.from(element.children)
          .find((child) => child.tagName.toLowerCase() === field)
          ?.textContent?.trim() ?? '';
      const title = readField('title');
      const author = readField('author');
      const pages = Number(readField('pages'));

      if (!title || !author || !Number.isInteger(pages) || pages < 1) {
        throw new Error(`Book ${index + 1} must have a title, author, and positive page count.`);
      }

      return { title, author, pages };
    });
  }

  private escapeXml(value: string | number | undefined): string {
    return String(value ?? '').replace(/[<>&"']/g, (character) => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    })[character]!);
  }

  private downloadXml(xml: string): void {
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'books.xml';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
