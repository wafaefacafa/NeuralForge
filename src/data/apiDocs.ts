// EXPORTS: MOCK_API_GROUPS, MOCK_API_ENDPOINTS

import type { IApiGroup, IApiEndpoint } from '@/types/api';

export const MOCK_API_GROUPS: IApiGroup[] = [
  {
    name: 'inference',
    label: '推理 API',
    description: '模型推理与预测相关接口',
  },
  {
    name: 'model',
    label: '模型管理 API',
    description: '模型版本管理与操作接口',
  },
  {
    name: 'dataset',
    label: '数据集 API',
    description: '数据集上传、查询与管理接口',
  },
  {
    name: 'deploy',
    label: '部署 API',
    description: '模型部署与实例管理接口',
  },
];

export const MOCK_API_ENDPOINTS: IApiEndpoint[] = [
  // ---- 推理 API ----
  {
    id: 'inf-1',
    method: 'POST',
    path: '/v1/inference/predict',
    summary: '模型推理预测',
    description: '向已部署的模型发送推理请求，获取预测结果。支持批量输入。',
    group: 'inference',
    requestParams: [
      { name: 'model_id', type: 'string', required: true, description: '模型版本 ID' },
      { name: 'inputs', type: 'array<object>', required: true, description: '输入数据数组，每项为键值对' },
      { name: 'return_probabilities', type: 'boolean', required: false, description: '是否返回概率分布，默认 false' },
    ],
    requestBody: `{
  "model_id": "mdl_v2.3.1",
  "inputs": [
    { "feature_1": 0.5, "feature_2": 1.2, "feature_3": -0.8 },
    { "feature_1": 0.3, "feature_2": 0.9, "feature_3": 0.1 }
  ],
  "return_probabilities": true
}`,
    responses: [
      {
        status: 200,
        description: '推理成功',
        body: `{
  "predictions": [
    { "class": "cat", "probability": 0.923 },
    { "class": "dog", "probability": 0.874 }
  ],
  "model_version": "v2.3.1",
  "latency_ms": 42
}`,
      },
      {
        status: 400,
        description: '请求参数错误',
        body: `{
  "error": "invalid_input",
  "message": "inputs 字段不能为空"
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `import neuralforge

client = neuralforge.Client(api_key="nf_xxx")
result = client.inference.predict(
    model_id="mdl_v2.3.1",
    inputs=[{"feature_1": 0.5, "feature_2": 1.2}],
    return_probabilities=True
)
print(result.predictions)`,
      },
      {
        language: 'javascript',
        code: `const { NeuralForge } = require('neuralforge-sdk');

const client = new NeuralForge({ apiKey: 'nf_xxx' });
const result = await client.inference.predict({
  modelId: 'mdl_v2.3.1',
  inputs: [{ feature_1: 0.5, feature_2: 1.2 }],
  returnProbabilities: true,
});
console.log(result.predictions);`,
      },
      {
        language: 'curl',
        code: `curl -X POST https://api.neuralforge.io/v1/inference/predict \\
  -H "Authorization: Bearer nf_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "mdl_v2.3.1",
    "inputs": [{"feature_1": 0.5, "feature_2": 1.2}],
    "return_probabilities": true
  }'`,
      },
    ],
  },
  {
    id: 'inf-2',
    method: 'POST',
    path: '/v1/inference/batch',
    summary: '批量异步推理',
    description: '提交大批量数据异步推理任务，返回任务 ID 用于轮询结果。',
    group: 'inference',
    requestParams: [
      { name: 'model_id', type: 'string', required: true, description: '模型版本 ID' },
      { name: 'dataset_id', type: 'string', required: true, description: '数据集 ID' },
      { name: 'output_format', type: 'string', required: false, description: '输出格式：json / csv，默认 json' },
    ],
    requestBody: `{
  "model_id": "mdl_v2.3.1",
  "dataset_id": "ds_imgnet_v3",
  "output_format": "json"
}`,
    responses: [
      {
        status: 202,
        description: '任务已提交',
        body: `{
  "task_id": "task_batch_20240625_001",
  "status": "queued",
  "estimated_duration_sec": 120
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `task = client.inference.batch_predict(
    model_id="mdl_v2.3.1",
    dataset_id="ds_imgnet_v3"
)
print(f"任务已提交: {task.task_id}")`,
      },
      {
        language: 'javascript',
        code: `const task = await client.inference.batchPredict({
  modelId: 'mdl_v2.3.1',
  datasetId: 'ds_imgnet_v3',
});
console.log('任务已提交:', task.taskId);`,
      },
      {
        language: 'curl',
        code: `curl -X POST https://api.neuralforge.io/v1/inference/batch \\
  -H "Authorization: Bearer nf_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"model_id":"mdl_v2.3.1","dataset_id":"ds_imgnet_v3"}'`,
      },
    ],
  },
  {
    id: 'inf-3',
    method: 'GET',
    path: '/v1/inference/task/{task_id}',
    summary: '查询推理任务状态',
    description: '根据任务 ID 查询异步推理任务的执行状态与结果。',
    group: 'inference',
    requestParams: [
      { name: 'task_id', type: 'string', required: true, description: '推理任务 ID（路径参数）' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "task_id": "task_batch_20240625_001",
  "status": "completed",
  "progress": 100,
  "result_url": "https://storage.neuralforge.io/results/task_batch_20240625_001.json"
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `status = client.inference.get_task("task_batch_20240625_001")
print(f"状态: {status.status}, 进度: {status.progress}%")`,
      },
      {
        language: 'javascript',
        code: `const status = await client.inference.getTask('task_batch_20240625_001');
console.log('状态:', status.status, '进度:', status.progress + '%');`,
      },
      {
        language: 'curl',
        code: `curl https://api.neuralforge.io/v1/inference/task/task_batch_20240625_001 \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },

  // ---- 模型管理 API ----
  {
    id: 'mdl-1',
    method: 'GET',
    path: '/v1/models',
    summary: '获取模型版本列表',
    description: '查询所有模型版本，支持按项目、框架、状态筛选和分页。',
    group: 'model',
    requestParams: [
      { name: 'project_id', type: 'string', required: false, description: '按项目 ID 筛选' },
      { name: 'framework', type: 'string', required: false, description: '框架：pytorch / tensorflow / jax' },
      { name: 'status', type: 'string', required: false, description: '状态：ready / training / deployed' },
      { name: 'page', type: 'integer', required: false, description: '页码，默认 1' },
      { name: 'page_size', type: 'integer', required: false, description: '每页条数，默认 20' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "data": [
    {
      "id": "mdl_v2.3.1",
      "model_name": "ResNet-50-ImageNet",
      "framework": "PyTorch",
      "accuracy": 0.942,
      "f1_score": 0.938,
      "status": "deployed",
      "created_at": "2024-06-20T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `models = client.models.list(
    project_id="proj_img_cls",
    framework="pytorch",
    status="ready"
)
for m in models.data:
    print(f"{m.model_name}: Accuracy={m.accuracy}")`,
      },
      {
        language: 'javascript',
        code: `const models = await client.models.list({
  projectId: 'proj_img_cls',
  framework: 'pytorch',
  status: 'ready',
});
models.data.forEach(m => console.log(m.modelName, m.accuracy));`,
      },
      {
        language: 'curl',
        code: `curl "https://api.neuralforge.io/v1/models?project_id=proj_img_cls&framework=pytorch" \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },
  {
    id: 'mdl-2',
    method: 'GET',
    path: '/v1/models/{model_id}',
    summary: '获取模型详情',
    description: '获取指定模型版本的详细信息，包括超参数、训练环境和评估指标。',
    group: 'model',
    requestParams: [
      { name: 'model_id', type: 'string', required: true, description: '模型版本 ID（路径参数）' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "id": "mdl_v2.3.1",
  "model_name": "ResNet-50-ImageNet",
  "project_id": "proj_img_cls",
  "framework": "PyTorch",
  "accuracy": 0.942,
  "precision": 0.940,
  "recall": 0.936,
  "f1_score": 0.938,
  "size_mb": 98.5,
  "hyperparams": {
    "learning_rate": 0.001,
    "batch_size": 64,
    "epochs": 100,
    "optimizer": "adamw"
  },
  "training_env": {
    "gpu_type": "A100",
    "gpu_count": 4,
    "memory_gb": 256
  },
  "status": "deployed",
  "created_at": "2024-06-20T10:30:00Z"
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `model = client.models.get("mdl_v2.3.1")
print(f"{model.model_name}: {model.accuracy:.2%}")`,
      },
      {
        language: 'javascript',
        code: `const model = await client.models.get('mdl_v2.3.1');
console.log(model.modelName, (model.accuracy * 100).toFixed(1) + '%');`,
      },
      {
        language: 'curl',
        code: `curl https://api.neuralforge.io/v1/models/mdl_v2.3.1 \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },
  {
    id: 'mdl-3',
    method: 'DELETE',
    path: '/v1/models/{model_id}',
    summary: '删除模型版本',
    description: '删除指定的模型版本。已部署的模型需先停止部署实例。',
    group: 'model',
    requestParams: [
      { name: 'model_id', type: 'string', required: true, description: '模型版本 ID（路径参数）' },
    ],
    responses: [
      {
        status: 200,
        description: '删除成功',
        body: `{
  "message": "模型版本 mdl_v2.3.1 已删除",
  "deleted_at": "2024-06-25T14:00:00Z"
}`,
      },
      {
        status: 409,
        description: '模型已部署，无法删除',
        body: `{
  "error": "model_deployed",
  "message": "请先停止所有部署实例后再删除模型"
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `client.models.delete("mdl_v2.3.1")
print("模型已删除")`,
      },
      {
        language: 'javascript',
        code: `await client.models.delete('mdl_v2.3.1');
console.log('模型已删除');`,
      },
      {
        language: 'curl',
        code: `curl -X DELETE https://api.neuralforge.io/v1/models/mdl_v2.3.1 \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },
  {
    id: 'mdl-4',
    method: 'POST',
    path: '/v1/models/compare',
    summary: '模型版本对比',
    description: '对比两个模型版本的评估指标，返回差异分析。',
    group: 'model',
    requestParams: [
      { name: 'model_id_a', type: 'string', required: true, description: '模型版本 A 的 ID' },
      { name: 'model_id_b', type: 'string', required: true, description: '模型版本 B 的 ID' },
    ],
    requestBody: `{
  "model_id_a": "mdl_v2.3.1",
  "model_id_b": "mdl_v2.2.0"
}`,
    responses: [
      {
        status: 200,
        description: '对比成功',
        body: `{
  "version_a": { "id": "mdl_v2.3.1", "accuracy": 0.942, "f1_score": 0.938 },
  "version_b": { "id": "mdl_v2.2.0", "accuracy": 0.915, "f1_score": 0.907 },
  "diffs": [
    { "metric": "accuracy", "value_a": 0.942, "value_b": 0.915, "diff": 0.027 },
    { "metric": "f1_score", "value_a": 0.938, "value_b": 0.907, "diff": 0.031 }
  ]
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `diff = client.models.compare("mdl_v2.3.1", "mdl_v2.2.0")
for d in diff.diffs:
    print(f"{d.metric}: {d.diff:+.3f}")`,
      },
      {
        language: 'javascript',
        code: `const diff = await client.models.compare('mdl_v2.3.1', 'mdl_v2.2.0');
diff.diffs.forEach(d => console.log(d.metric, d.diff));`,
      },
      {
        language: 'curl',
        code: `curl -X POST https://api.neuralforge.io/v1/models/compare \\
  -H "Authorization: Bearer nf_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"model_id_a":"mdl_v2.3.1","model_id_b":"mdl_v2.2.0"}'`,
      },
    ],
  },

  // ---- 数据集 API ----
  {
    id: 'ds-1',
    method: 'GET',
    path: '/v1/datasets',
    summary: '获取数据集列表',
    description: '查询所有数据集，支持按类别、格式筛选和分页。',
    group: 'dataset',
    requestParams: [
      { name: 'category', type: 'string', required: false, description: '类别：image / text / tabular / audio' },
      { name: 'format', type: 'string', required: false, description: '格式：csv / json / parquet / image' },
      { name: 'page', type: 'integer', required: false, description: '页码，默认 1' },
      { name: 'page_size', type: 'integer', required: false, description: '每页条数，默认 20' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "data": [
    {
      "id": "ds_imgnet_v3",
      "name": "ImageNet-subset",
      "sample_count": 50000,
      "size": "12.5 GB",
      "version": "v3",
      "status": "ready",
      "category": "image",
      "format": "parquet",
      "created_at": "2024-05-15T08:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "page_size": 20
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `datasets = client.datasets.list(category="image", format="parquet")
for ds in datasets.data:
    print(f"{ds.name}: {ds.sample_count} samples")`,
      },
      {
        language: 'javascript',
        code: `const datasets = await client.datasets.list({ category: 'image' });
datasets.data.forEach(ds => console.log(ds.name, ds.sampleCount));`,
      },
      {
        language: 'curl',
        code: `curl "https://api.neuralforge.io/v1/datasets?category=image" \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },
  {
    id: 'ds-2',
    method: 'POST',
    path: '/v1/datasets/upload',
    summary: '上传数据集',
    description: '上传新的数据集文件，支持 CSV、JSON、Parquet 和图片压缩包格式。',
    group: 'dataset',
    requestParams: [
      { name: 'name', type: 'string', required: true, description: '数据集名称' },
      { name: 'description', type: 'string', required: false, description: '数据集描述' },
      { name: 'category', type: 'string', required: true, description: '类别：image / text / tabular / audio' },
      { name: 'file', type: 'file', required: true, description: '数据集文件（multipart/form-data）' },
    ],
    responses: [
      {
        status: 201,
        description: '上传成功',
        body: `{
  "id": "ds_new_001",
  "name": "custom-dataset",
  "status": "processing",
  "message": "数据集已上传，正在处理中"
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `dataset = client.datasets.upload(
    name="custom-dataset",
    description="自定义训练数据",
    category="image",
    file_path="./data/images.zip"
)
print(f"数据集已上传: {dataset.id}")`,
      },
      {
        language: 'javascript',
        code: `const dataset = await client.datasets.upload({
  name: 'custom-dataset',
  description: '自定义训练数据',
  category: 'image',
  file: fs.createReadStream('./data/images.zip'),
});
console.log('数据集已上传:', dataset.id);`,
      },
      {
        language: 'curl',
        code: `curl -X POST https://api.neuralforge.io/v1/datasets/upload \\
  -H "Authorization: Bearer nf_xxx" \\
  -F "name=custom-dataset" \\
  -F "category=image" \\
  -F "file=@./data/images.zip"`,
      },
    ],
  },
  {
    id: 'ds-3',
    method: 'GET',
    path: '/v1/datasets/{dataset_id}/preview',
    summary: '预览数据集样本',
    description: '获取数据集的前 N 条样本数据，用于快速预览数据内容。',
    group: 'dataset',
    requestParams: [
      { name: 'dataset_id', type: 'string', required: true, description: '数据集 ID（路径参数）' },
      { name: 'limit', type: 'integer', required: false, description: '返回条数，默认 20，最大 100' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "dataset_id": "ds_imgnet_v3",
  "total_samples": 50000,
  "samples": [
    { "id": "1", "image_url": "https://...", "label": "cat", "width": 224, "height": 224 },
    { "id": "2", "image_url": "https://...", "label": "dog", "width": 224, "height": 224 }
  ]
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `samples = client.datasets.preview("ds_imgnet_v3", limit=10)
for s in samples.samples:
    print(f"{s.id}: {s.label}")`,
      },
      {
        language: 'javascript',
        code: `const samples = await client.datasets.preview('ds_imgnet_v3', { limit: 10 });
samples.samples.forEach(s => console.log(s.id, s.label));`,
      },
      {
        language: 'curl',
        code: `curl "https://api.neuralforge.io/v1/datasets/ds_imgnet_v3/preview?limit=10" \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },

  // ---- 部署 API ----
  {
    id: 'dep-1',
    method: 'POST',
    path: '/v1/deployments',
    summary: '创建部署',
    description: '将指定模型版本部署到目标环境，配置实例规格和扩缩容策略。',
    group: 'deploy',
    requestParams: [
      { name: 'model_version_id', type: 'string', required: true, description: '模型版本 ID' },
      { name: 'environment', type: 'string', required: true, description: '环境：production / staging / testing' },
      { name: 'instance_type', type: 'string', required: true, description: '实例类型：cpu-standard / gpu-a100 / gpu-v100' },
      { name: 'instance_count', type: 'integer', required: true, description: '实例数量，最小 1' },
      { name: 'auto_scale', type: 'object', required: false, description: '自动扩缩容配置' },
    ],
    requestBody: `{
  "model_version_id": "mdl_v2.3.1",
  "environment": "production",
  "instance_type": "gpu-a100",
  "instance_count": 2,
  "auto_scale": {
    "enabled": true,
    "min_instances": 1,
    "max_instances": 8,
    "cpu_threshold": 70
  }
}`,
    responses: [
      {
        status: 201,
        description: '部署已创建',
        body: `{
  "deployment_id": "dep_prod_001",
  "status": "deploying",
  "endpoint": "https://api.neuralforge.io/deploy/dep_prod_001",
  "estimated_ready_sec": 60
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `deployment = client.deployments.create(
    model_version_id="mdl_v2.3.1",
    environment="production",
    instance_type="gpu-a100",
    instance_count=2,
    auto_scale={"enabled": True, "min_instances": 1, "max_instances": 8}
)
print(f"部署已创建: {deployment.endpoint}")`,
      },
      {
        language: 'javascript',
        code: `const deployment = await client.deployments.create({
  modelVersionId: 'mdl_v2.3.1',
  environment: 'production',
  instanceType: 'gpu-a100',
  instanceCount: 2,
  autoScale: { enabled: true, minInstances: 1, maxInstances: 8 },
});
console.log('部署已创建:', deployment.endpoint);`,
      },
      {
        language: 'curl',
        code: `curl -X POST https://api.neuralforge.io/v1/deployments \\
  -H "Authorization: Bearer nf_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_version_id": "mdl_v2.3.1",
    "environment": "production",
    "instance_type": "gpu-a100",
    "instance_count": 2
  }'`,
      },
    ],
  },
  {
    id: 'dep-2',
    method: 'GET',
    path: '/v1/deployments',
    summary: '获取部署实例列表',
    description: '查询所有部署实例，支持按状态、环境筛选。',
    group: 'deploy',
    requestParams: [
      { name: 'status', type: 'string', required: false, description: '状态：running / stopped / deploying / failed' },
      { name: 'environment', type: 'string', required: false, description: '环境：production / staging / testing' },
      { name: 'page', type: 'integer', required: false, description: '页码，默认 1' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "data": [
    {
      "id": "dep_prod_001",
      "model_version_id": "mdl_v2.3.1",
      "model_name": "ResNet-50-ImageNet",
      "status": "running",
      "endpoint": "https://api.neuralforge.io/deploy/dep_prod_001",
      "environment": "production",
      "instance_count": 2,
      "qps": 1250,
      "uptime": "72h 15m",
      "created_at": "2024-06-22T08:00:00Z"
    }
  ],
  "total": 5,
  "page": 1
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `deployments = client.deployments.list(status="running")
for d in deployments.data:
    print(f"{d.model_name}: {d.status} @ {d.endpoint}")`,
      },
      {
        language: 'javascript',
        code: `const deployments = await client.deployments.list({ status: 'running' });
deployments.data.forEach(d => console.log(d.modelName, d.status));`,
      },
      {
        language: 'curl',
        code: `curl "https://api.neuralforge.io/v1/deployments?status=running" \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },
  {
    id: 'dep-3',
    method: 'POST',
    path: '/v1/deployments/{deployment_id}/rollback',
    summary: '回滚部署版本',
    description: '将部署实例回滚到指定的历史模型版本。',
    group: 'deploy',
    requestParams: [
      { name: 'deployment_id', type: 'string', required: true, description: '部署实例 ID（路径参数）' },
      { name: 'target_version_id', type: 'string', required: true, description: '目标回滚版本 ID' },
    ],
    requestBody: `{
  "target_version_id": "mdl_v2.2.0",
  "reason": "新版本准确率下降，回滚至稳定版本"
}`,
    responses: [
      {
        status: 200,
        description: '回滚已触发',
        body: `{
  "deployment_id": "dep_prod_001",
  "from_version": "mdl_v2.3.1",
  "to_version": "mdl_v2.2.0",
  "status": "rolling_back",
  "estimated_duration_sec": 30
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `rollback = client.deployments.rollback(
    deployment_id="dep_prod_001",
    target_version_id="mdl_v2.2.0",
    reason="回滚至稳定版本"
)
print(f"回滚中: {rollback.from_version} → {rollback.to_version}")`,
      },
      {
        language: 'javascript',
        code: `const rollback = await client.deployments.rollback('dep_prod_001', {
  targetVersionId: 'mdl_v2.2.0',
  reason: '回滚至稳定版本',
});
console.log('回滚中:', rollback.fromVersion, '→', rollback.toVersion);`,
      },
      {
        language: 'curl',
        code: `curl -X POST https://api.neuralforge.io/v1/deployments/dep_prod_001/rollback \\
  -H "Authorization: Bearer nf_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"target_version_id":"mdl_v2.2.0"}'`,
      },
    ],
  },
  {
    id: 'dep-4',
    method: 'GET',
    path: '/v1/deployments/{deployment_id}/logs',
    summary: '获取部署日志',
    description: '获取指定部署实例的实时运行日志，支持时间范围和日志级别筛选。',
    group: 'deploy',
    requestParams: [
      { name: 'deployment_id', type: 'string', required: true, description: '部署实例 ID（路径参数）' },
      { name: 'level', type: 'string', required: false, description: '日志级别：info / warn / error，默认全部' },
      { name: 'limit', type: 'integer', required: false, description: '返回条数，默认 100' },
    ],
    responses: [
      {
        status: 200,
        description: '查询成功',
        body: `{
  "deployment_id": "dep_prod_001",
  "logs": [
    { "timestamp": "2024-06-25T14:30:01Z", "level": "info", "message": "Request processed: 200 OK, latency=42ms" },
    { "timestamp": "2024-06-25T14:30:00Z", "level": "info", "message": "Health check passed" }
  ]
}`,
      },
    ],
    sdkExamples: [
      {
        language: 'python',
        code: `logs = client.deployments.get_logs("dep_prod_001", level="error", limit=50)
for log in logs.logs:
    print(f"[{log.timestamp}] {log.level}: {log.message}")`,
      },
      {
        language: 'javascript',
        code: `const logs = await client.deployments.getLogs('dep_prod_001', { level: 'error', limit: 50 });
logs.logs.forEach(log => console.log(log.timestamp, log.level, log.message));`,
      },
      {
        language: 'curl',
        code: `curl "https://api.neuralforge.io/v1/deployments/dep_prod_001/logs?level=error&limit=50" \\
  -H "Authorization: Bearer nf_xxx"`,
      },
    ],
  },
];
