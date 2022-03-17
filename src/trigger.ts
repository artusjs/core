// import { Injectable } from "@artus/injection";

import { Injectable } from "@artus/injection";

@Injectable()
export class Trigger {
  stratPipeline() {
    console.log('start pipeline');
  }
}
