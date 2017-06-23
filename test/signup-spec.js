/* global describe, browser, it, element, by */
describe('very.gd sign up', function() {
    it('should create a user and log them in', function() {
        browser.get('http://localhost:8082/sign-up');

        element(by.model('model.name')).sendKeys('Jason Farrell');
        element(by.model('model.email')).sendKeys('jason+' + Date.now() + '@useallfive.com');
        element(by.model('model.password')).sendKeys('demo');
        element(by.css('.modal-submit')).click();

        browser.wait(function() {
            return element(by.css('h1.scene__instruct--title')).isPresent();
        }, 1400);
    });
});
