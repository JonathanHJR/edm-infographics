export type Infographic = {
  id: string;
  title: string;
  description: string;
  src: string;
  width: number;
  height: number;
};

export const infographics: Infographic[] = [
  {
    id: "optimus-v2-bulk-upload-guide",
    title: "Optimus V2 Bulk Upload Guide",
    description:
      "Step-by-step metadata tagging guide for bulk-uploading documents in Optimus V2.",
    src: "/infographic_v15_13.png",
    width: 3072,
    height: 5504,
  },
];
