interface LocalStorageUser {
    id: string;
    username: string;
    role: string;
}

export interface User {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    role: 'user' | 'admin';
    profilePhoto?: string;
    connections: string[];
    documents: string[];
    isActive: boolean;
    createdAt: string;
}

export interface Document {
    _id: string;
    title: string;
    content: any;
    creator: { _id: string; profilePhoto?: string; firstName: string; lastName?: string };
    collaborators: { _id: string; profilePhoto?: string; firstName: string; lastName?: string }[];
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface AdminUsers {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    role: 'user' | 'admin';
    profilePhoto?: string;
    connections: string[];
    documents: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


export interface AdminDocuments {
    _id: string;
    title: string;
    content: any;
    creator: { _id: string; firstName: string; lastName?: string };
    collaborators: { _id: string; firstName: string; lastName?: string }[];
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
};