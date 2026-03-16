package org.nself.tasks

import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MainActivityTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun testAppContext() {
        val appContext = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("org.nself.tasks", appContext.packageName)
    }

    @Test
    fun testMainActivityLaunches() {
        activityRule.scenario.onActivity { activity ->
            assert(activity != null)
        }
    }

    @Test
    fun testWebViewIsDisplayed() {
        // Capacitor apps render in a WebView
        onView(withClassName(org.hamcrest.Matchers.containsString("WebView")))
            .check(matches(isDisplayed()))
    }
}
