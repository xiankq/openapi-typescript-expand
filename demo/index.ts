import axios from 'axios';

import { openapiTypescriptExpand } from '../src';

(async () => {
  const url
    = 'http://127.0.0.1:4523/export/openapi?projectId=1103411&specialPurpose=openapi-generator';
  const { data } = await axios.request({
    url,
    method: 'get',
  });

  openapiTypescriptExpand(data, {
    output: './demo/genapi/haikang.ts',
    requestName: 'request',
    headerCode: 'import request from \'./request\';\n',
  });
})();
