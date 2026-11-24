export type ProjectCategory = {
  id: number;
  name: string;
  slug: string;
  projectCount?: number;
};

export type ProjectImage = {
  id: number;
  path: string;
};

export type PublicProject = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  category: ProjectCategory | null;
  mainImage: string;
  isFeatured: boolean;
  createdAt: string;
  images: ProjectImage[];
};

export type PublicProjectDetail = PublicProject & {
  fullDescription: string;
};

export type AdminProject = PublicProjectDetail & {
  categoryId: number | null;
  status: "published" | "draft";
  displayOrder: number;
  updatedAt: string;
};

export type ProjectCounts = {
  total: number;
  published: number;
  drafts: number;
  featured: number;
};
