import XCTest

final class AppUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Launch tests

    func testAppLaunchesSuccessfully() throws {
        XCTAssertTrue(app.state == .runningForeground)
    }

    func testInitialScreenLoads() throws {
        // The web view should load within 15 seconds
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 15),
                      "WebView should exist after app launch")
    }

    // MARK: - Navigation tests

    func testCanNavigateToApp() throws {
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 15))

        // The app loads the web content
        XCTAssertTrue(app.state == .runningForeground)
    }

    // MARK: - Accessibility tests

    func testAccessibilityElementsExist() throws {
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: 15))

        // Ensure there are accessible elements
        let allElements = app.descendants(matching: .any)
        XCTAssertGreaterThan(allElements.count, 0)
    }

    // MARK: - Performance tests

    func testLaunchPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }
}
