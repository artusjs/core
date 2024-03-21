import { Injectable } from '../../../../src/';

@Injectable()
export default class DemoController {
    public async index() {
        return { code: 0, message: 'ok', data: {} };
    }
}
