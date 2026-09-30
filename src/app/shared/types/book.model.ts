export interface Book { 
    id?: number;
    title?: string;
    pages?: number;
    author?: string;
}

export interface BookFilter {
    searchValue: string;
    sortState: {
        active: 'id' | 'title' | 'pages' | 'author';
        direction: 'asc' | 'desc';
    };
}