import { openapiTypescriptExpand } from '../src';
import data from './openapi.json';

(async () => {
  openapiTypescriptExpand(data, {
    output: './demo/genapi/haikang.ts',
    requestName: 'request',
    headerCode: 'import request from \'./request\';\n',
  });
})();
