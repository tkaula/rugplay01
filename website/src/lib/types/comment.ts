export interface Comment {
    id: number;
    content: string;
    likesCount: number;
    createdAt: string;
    updatedAt: string;
    userId: number;
    userName: string;
    userUsername: string;
    userImage: string | null;
    isLikedByUser: boolean;

    userBio: string | null;
    userCreatedAt: string;
}

export interface CommentLike {
    userId: number;
    commentId: number;
    createdAt: string;
}
