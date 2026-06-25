// EXPORTS: IDataset, IDatasetVersion, IDatasetSample, IDatasetUploadForm

export interface IDataset {
  id: string;
  name: string;
  description: string;
  sampleCount: number;
  size: string;
  version: string;
  status: 'ready' | 'processing' | 'error';
  format: 'csv' | 'json' | 'parquet' | 'image';
  category: 'image' | 'text' | 'tabular' | 'audio';
  createdAt: string;
  updatedAt: string;
  versions: IDatasetVersion[];
}

export interface IDatasetVersion {
  id: string;
  version: string;
  sampleCount: number;
  size: string;
  createdAt: string;
  changelog: string;
}

export interface IDatasetSample {
  id: string;
  datasetId: string;
  fields: Record<string, string | number>;
}

export interface IDatasetUploadForm {
  name: string;
  description: string;
  category: 'image' | 'text' | 'tabular' | 'audio';
  format: 'csv' | 'json' | 'parquet' | 'image';
  file?: File;
}
