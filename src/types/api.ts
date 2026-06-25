// EXPORTS: IApiEndpoint, IApiGroup, IApiRequestParam, IApiResponseExample, IApiSdkExample

export interface IApiRequestParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface IApiResponseExample {
  status: number;
  description: string;
  body: string;
}

export interface IApiSdkExample {
  language: 'python' | 'javascript' | 'curl';
  code: string;
}

export interface IApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  group: string;
  requestParams: IApiRequestParam[];
  requestBody?: string;
  responses: IApiResponseExample[];
  sdkExamples: IApiSdkExample[];
}

export interface IApiGroup {
  name: string;
  label: string;
  description: string;
}
