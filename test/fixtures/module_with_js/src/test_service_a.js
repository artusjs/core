module.exports = class TestServiceA {
  testMethod (app) {
    return app.testServiceB.sayHello();
  }
}
