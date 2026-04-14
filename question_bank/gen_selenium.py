"""
Generate 500 unique Python Selenium questions and write to python_selenium_questions.csv
"""

import pandas as pd
import csv
import random

random.seed(42)


def build_questions():
    questions = []
    qid = 0

    def add(subject, topic, difficulty, qtype, question, a, b, c, d, correct, explanation, code_snippet=""):
        nonlocal qid
        qid += 1
        questions.append({
            "id": qid,
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "type": qtype,
            "question": question,
            "option_a": a,
            "option_b": b,
            "option_c": c,
            "option_d": d,
            "correct_answer": correct,
            "explanation": explanation,
            "code_snippet": code_snippet,
        })

    SUBJECT = "Python Selenium"

    # ===================== WEBDRIVER SETUP =====================
    # MCQ (12)
    add(SUBJECT, "WebDriver Setup", "Easy", "mcq",
        "Which pip command installs the Selenium package?",
        "pip install selenium", "pip install webdriver", "pip install selenium-webdriver", "pip install browser-driver",
        "A", "The official package name on PyPI is selenium, installed via pip install selenium.")

    add(SUBJECT, "WebDriver Setup", "Easy", "mcq",
        "Which class is used to launch a Chrome browser in Selenium 4?",
        "webdriver.Chrome()", "webdriver.ChromeBrowser()", "webdriver.LaunchChrome()", "Chrome.start()",
        "A", "In Selenium 4, webdriver.Chrome() creates a new Chrome browser instance.")

    add(SUBJECT, "WebDriver Setup", "Easy", "mcq",
        "What does driver.quit() do?",
        "Closes only the current tab", "Closes the browser and ends the WebDriver session", "Minimizes the browser", "Refreshes the page",
        "B", "driver.quit() closes all browser windows and terminates the WebDriver session.")

    add(SUBJECT, "WebDriver Setup", "Easy", "mcq",
        "Which import statement is needed to use Selenium WebDriver?",
        "from selenium import webdriver", "import selenium.driver", "from webdriver import selenium", "import browser.selenium",
        "A", "The standard import is from selenium import webdriver.")

    add(SUBJECT, "WebDriver Setup", "Medium", "mcq",
        "What is the difference between driver.close() and driver.quit()?",
        "close() closes the current window; quit() closes all windows and ends the session",
        "They are identical", "close() ends the session; quit() closes the current window",
        "close() is deprecated in Selenium 4",
        "A", "close() closes only the focused window, while quit() closes all windows and stops the WebDriver process.")

    add(SUBJECT, "WebDriver Setup", "Medium", "mcq",
        "Which class is used to set Chrome-specific options before launching the browser?",
        "ChromeOptions()", "ChromeConfig()", "ChromePreferences()", "ChromeSettings()",
        "A", "selenium.webdriver.ChromeOptions() (or webdriver.ChromeOptions()) is used to configure Chrome launch options.")

    add(SUBJECT, "WebDriver Setup", "Medium", "mcq",
        "How do you add command-line arguments to Chrome via Selenium?",
        "options.add_argument('--arg')", "options.set_flag('--arg')", "options.chrome_args('--arg')", "driver.add_arg('--arg')",
        "A", "ChromeOptions.add_argument() is used to pass command-line flags to Chrome.")

    add(SUBJECT, "WebDriver Setup", "Hard", "mcq",
        "In Selenium 4, how do you specify a custom browser binary location for Chrome?",
        "options.binary_location = '/path/to/chrome'", "options.set_binary('/path/to/chrome')", "options.chrome_path = '/path/to/chrome'", "driver.binary = '/path/to/chrome'",
        "A", "The binary_location attribute on ChromeOptions specifies a custom Chrome binary path.")

    add(SUBJECT, "WebDriver Setup", "Hard", "mcq",
        "Which Selenium 4 feature eliminated the need to manually download browser drivers?",
        "Selenium Manager", "DriverFactory", "AutoDriver", "BrowserBridge",
        "A", "Selenium Manager, introduced in Selenium 4.6+, automatically manages browser driver binaries.")

    add(SUBJECT, "WebDriver Setup", "Easy", "mcq",
        "Which method navigates the browser to a URL?",
        "driver.get(url)", "driver.navigate(url)", "driver.open(url)", "driver.load(url)",
        "A", "driver.get(url) navigates the browser to the specified URL.")

    add(SUBJECT, "WebDriver Setup", "Medium", "mcq",
        "What does driver.maximize_window() do?",
        "Maximizes the browser window to fill the screen", "Sets the window to 1920x1080", "Opens a new maximized tab", "Enters full-screen mode",
        "A", "driver.maximize_window() maximizes the browser window to the screen size.")

    # Output (5)
    add(SUBJECT, "WebDriver Setup", "Easy", "output",
        "What will be printed after executing this code?",
        "The title of the Google homepage", "An error message", "None", "The URL of Google",
        "A", "driver.title returns the title of the current page, which for Google is typically 'Google'.",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\ndriver.get('https://www.google.com')\nprint(driver.title)\ndriver.quit()")

    add(SUBJECT, "WebDriver Setup", "Medium", "output",
        "What does this code print?",
        "https://www.google.com", "True", "The page title", "An empty string",
        "A", "driver.current_url returns the URL of the current page after navigation.",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\ndriver.get('https://www.google.com')\nprint(driver.current_url)\ndriver.quit()")

    add(SUBJECT, "WebDriver Setup", "Medium", "output",
        "What type of object is returned by webdriver.Chrome()?",
        "WebDriver instance", "Browser object", "ChromeSession", "HTTPClient",
        "A", "webdriver.Chrome() returns a WebDriver instance (specifically a Chrome WebDriver).",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\nprint(type(driver).__name__)\ndriver.quit()")

    add(SUBJECT, "WebDriver Setup", "Hard", "output",
        "What is the output of this code snippet?",
        "A list of all cookies as dictionaries", "An empty list", "A single cookie string", "None",
        "B", "A freshly opened browser with no prior navigation to a domain returns an empty cookie list.",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\nprint(driver.get_cookies())\ndriver.quit()")

    add(SUBJECT, "WebDriver Setup", "Hard", "output",
        "What does this code print?",
        "The page source HTML as a string", "The DOM object", "A binary response", "An error",
        "A", "driver.page_source returns the HTML source of the current page as a string.",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\ndriver.get('https://www.google.com')\nprint(type(driver.page_source))\ndriver.quit()")

    # Scenario (5)
    add(SUBJECT, "WebDriver Setup", "Easy", "scenario",
        "You need to automate a test that opens Firefox instead of Chrome. Which WebDriver class should you use?",
        "webdriver.Firefox()", "webdriver.Gecko()", "webdriver.MozillaBrowser()", "webdriver.FFDriver()",
        "A", "webdriver.Firefox() creates a Firefox WebDriver instance using GeckoDriver.")

    add(SUBJECT, "WebDriver Setup", "Medium", "scenario",
        "Your test needs to disable browser notifications in Chrome. Which approach is correct?",
        "options.add_argument('--disable-notifications')", "driver.disable_notifications()", "options.set_preference('notifications', False)", "driver.execute_script('disable notifications')",
        "A", "The --disable-notifications Chrome flag is passed via add_argument on ChromeOptions.")

    add(SUBJECT, "WebDriver Setup", "Medium", "scenario",
        "You want to start Chrome with a specific user profile directory. How do you achieve this?",
        "options.add_argument('--user-data-dir=/path/to/profile')", "driver.set_profile('/path/to/profile')", "options.profile = '/path/to/profile'", "ChromeProfile('/path/to/profile')",
        "A", "The --user-data-dir argument on ChromeOptions points Chrome to a specific profile directory.")

    add(SUBJECT, "WebDriver Setup", "Hard", "scenario",
        "Your CI/CD pipeline requires Chrome to run without a GPU. Which argument should you add?",
        "options.add_argument('--disable-gpu')", "options.add_argument('--no-graphics')", "options.add_argument('--cpu-only')", "options.add_argument('--headless-gpu')",
        "A", "The --disable-gpu flag disables GPU hardware acceleration, often used in headless/CI environments.")

    add(SUBJECT, "WebDriver Setup", "Hard", "scenario",
        "You need to set a custom window size of 1366x768 at browser launch. What is the correct approach?",
        "options.add_argument('--window-size=1366,768')", "driver.set_window_size(1366, 768) before get()", "options.window_size = (1366, 768)", "driver.resize(1366, 768)",
        "A", "The --window-size=W,H argument sets the initial browser window size at launch time.")

    # Code Completion (5)
    add(SUBJECT, "WebDriver Setup", "Easy", "code_completion",
        "Complete the code to launch a Chrome browser and navigate to a website.",
        "webdriver.Chrome(); driver.get('https://example.com')", "webdriver.Browser(); driver.open('https://example.com')", "webdriver.Launch(); driver.navigate('https://example.com')", "Chrome(); driver.browse('https://example.com')",
        "A", "webdriver.Chrome() creates the driver and driver.get() navigates to the URL.",
        "from selenium import webdriver\ndriver = ___\n___\ndriver.quit()")

    add(SUBJECT, "WebDriver Setup", "Medium", "code_completion",
        "Complete the code to set Chrome to start maximized.",
        "ChromeOptions(); options.add_argument('--start-maximized')", "ChromeOptions(); options.maximize()", "ChromeConfig(); config.maximized = True", "ChromeOptions(); options.set('maximized', True)",
        "A", "ChromeOptions with --start-maximized argument launches Chrome in maximized state.",
        "from selenium import webdriver\noptions = webdriver.___\n___\ndriver = webdriver.Chrome(options=options)")

    add(SUBJECT, "WebDriver Setup", "Medium", "code_completion",
        "Complete the code to set an implicit wait of 10 seconds.",
        "driver.implicitly_wait(10)", "driver.set_implicit_wait(10)", "driver.wait(10)", "driver.timeout(10)",
        "A", "implicitly_wait(seconds) sets the implicit wait timeout on the driver.",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\n___\ndriver.get('https://example.com')")

    add(SUBJECT, "WebDriver Setup", "Hard", "code_completion",
        "Complete the code to add a Chrome extension at launch.",
        "options.add_extension('/path/to/ext.crx')", "options.load_extension('/path/to/ext.crx')", "options.extensions.add('/path/to/ext.crx')", "driver.install_extension('/path/to/ext.crx')",
        "A", "add_extension() on ChromeOptions loads a .crx extension file at browser launch.",
        "from selenium import webdriver\noptions = webdriver.ChromeOptions()\n___\ndriver = webdriver.Chrome(options=options)")

    add(SUBJECT, "WebDriver Setup", "Hard", "code_completion",
        "Complete the code to set experimental Chrome options to disable automation flags.",
        "options.add_experimental_option('excludeSwitches', ['enable-automation'])", "options.set_experiment('no-automation', True)", "options.disable_automation()", "options.add_argument('--no-automation')",
        "A", "add_experimental_option with excludeSwitches removes the automation-controlled banner.",
        "from selenium import webdriver\noptions = webdriver.ChromeOptions()\n___\ndriver = webdriver.Chrome(options=options)")

    # ===================== LOCATORS =====================
    # MCQ (12)
    add(SUBJECT, "Locators", "Easy", "mcq",
        "Which method finds a single element by its ID attribute?",
        "driver.find_element(By.ID, 'myid')", "driver.get_element('myid')", "driver.locate(By.ID, 'myid')", "driver.search(id='myid')",
        "A", "find_element(By.ID, value) locates a single element by its HTML id attribute.")

    add(SUBJECT, "Locators", "Easy", "mcq",
        "Which import is needed to use By locator strategies?",
        "from selenium.webdriver.common.by import By", "from selenium.locators import By", "from selenium import By", "import selenium.By",
        "A", "The By class is in selenium.webdriver.common.by module.")

    add(SUBJECT, "Locators", "Easy", "mcq",
        "Which By strategy locates elements by their CSS class name?",
        "By.CLASS_NAME", "By.CSS_CLASS", "By.CLASSNAME", "By.ELEMENT_CLASS",
        "A", "By.CLASS_NAME matches elements by their CSS class attribute.")

    add(SUBJECT, "Locators", "Easy", "mcq",
        "Which locator strategy uses HTML tag names?",
        "By.TAG_NAME", "By.HTML_TAG", "By.ELEMENT", "By.TAG",
        "A", "By.TAG_NAME locates elements by their HTML tag name (e.g., 'div', 'input').")

    add(SUBJECT, "Locators", "Medium", "mcq",
        "What does find_elements() return when no elements match?",
        "An empty list", "None", "Raises NoSuchElementException", "An empty WebElement",
        "A", "find_elements() returns an empty list when no matching elements are found, unlike find_element() which raises an exception.")

    add(SUBJECT, "Locators", "Medium", "mcq",
        "Which CSS selector matches an element with both classes 'btn' and 'primary'?",
        ".btn.primary", ".btn .primary", ".btn + .primary", ".btn > .primary",
        "A", "Chaining class selectors without a space (.btn.primary) matches elements with both classes.")

    add(SUBJECT, "Locators", "Medium", "mcq",
        "Which XPath expression selects all div elements with class 'container'?",
        "//div[@class='container']", "/div[@class='container']", "//div[class='container']", "//div{class='container'}",
        "A", "//div[@class='container'] is the correct XPath syntax using @ for attributes.")

    add(SUBJECT, "Locators", "Medium", "mcq",
        "What is the difference between By.CSS_SELECTOR and By.XPATH?",
        "CSS_SELECTOR uses CSS syntax; XPATH uses XML path syntax", "They are interchangeable",
        "CSS_SELECTOR is faster but less powerful", "XPATH is deprecated in Selenium 4",
        "A", "CSS selectors use CSS syntax while XPath uses XML path language; both can locate elements but have different syntax and capabilities.")

    add(SUBJECT, "Locators", "Hard", "mcq",
        "Which XPath function is used for partial text matching?",
        "contains()", "includes()", "matches()", "like()",
        "A", "contains() in XPath checks if a string contains a substring, e.g., //div[contains(@class,'partial')].")

    add(SUBJECT, "Locators", "Hard", "mcq",
        "How do you locate an element using a partial link text?",
        "By.PARTIAL_LINK_TEXT", "By.LINK_CONTAINS", "By.PARTIAL_TEXT", "By.LINK_PARTIAL",
        "A", "By.PARTIAL_LINK_TEXT matches anchor elements whose visible text contains the specified substring.")

    add(SUBJECT, "Locators", "Easy", "mcq",
        "Which method returns a list of all matching elements?",
        "driver.find_elements()", "driver.find_all()", "driver.get_elements()", "driver.locate_all()",
        "A", "find_elements() returns a list of all WebElements matching the given locator.")

    # Output (6)
    add(SUBJECT, "Locators", "Easy", "output",
        "What does this code print if the page has an element with id='title' containing text 'Hello'?",
        "Hello", "title", "<h1>Hello</h1>", "None",
        "A", "element.text returns the visible text content of the element.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\nelem = driver.find_element(By.ID, 'title')\nprint(elem.text)\ndriver.quit()")

    add(SUBJECT, "Locators", "Medium", "output",
        "What does this code print if there are 5 paragraph elements on the page?",
        "5", "A list of WebElements", "True", "p",
        "A", "find_elements returns a list, and len() gives the count of matching elements.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\nelems = driver.find_elements(By.TAG_NAME, 'p')\nprint(len(elems))\ndriver.quit()")

    add(SUBJECT, "Locators", "Medium", "output",
        "What does this code print for an input element with value='admin'?",
        "admin", "None", "input", "An empty string",
        "A", "get_attribute('value') returns the value attribute of the input element.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com/login')\nelem = driver.find_element(By.ID, 'username')\nprint(elem.get_attribute('value'))\ndriver.quit()")

    add(SUBJECT, "Locators", "Hard", "output",
        "What does this code print if no elements match the CSS selector?",
        "0", "None", "NoSuchElementException", "An empty string",
        "A", "find_elements returns an empty list when nothing matches, so len() returns 0.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\nresult = driver.find_elements(By.CSS_SELECTOR, '.nonexistent')\nprint(len(result))\ndriver.quit()")

    add(SUBJECT, "Locators", "Hard", "output",
        "What does this code print for an element <a href='/about'>About Us</a>?",
        "/about", "About Us", "a", "https://example.com/about",
        "A", "get_attribute('href') returns the raw href attribute value of the anchor element.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\nlink = driver.find_element(By.LINK_TEXT, 'About Us')\nprint(link.get_attribute('href'))\ndriver.quit()")

    add(SUBJECT, "Locators", "Easy", "output",
        "What does this code print for a visible element?",
        "True", "False", "Visible", "1",
        "A", "is_displayed() returns True for visible elements on the page.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\nelem = driver.find_element(By.TAG_NAME, 'h1')\nprint(elem.is_displayed())\ndriver.quit()")

    # Scenario (6)
    add(SUBJECT, "Locators", "Easy", "scenario",
        "You need to find a login button with the text 'Sign In'. Which locator is most appropriate?",
        "By.LINK_TEXT if it is an anchor tag, or By.XPATH with text()", "By.ID only", "By.TAG_NAME", "By.CLASS_NAME",
        "A", "For text-based element finding, By.LINK_TEXT (for anchors) or XPath with text() function are appropriate.")

    add(SUBJECT, "Locators", "Medium", "scenario",
        "A page has multiple elements with the same class name. You need the third one. How do you get it?",
        "Use find_elements() and index [2]", "Use find_element() with index 3", "Use By.INDEX(3)", "Use CSS :nth-child with find_element()",
        "A", "find_elements() returns a list, so you can access the third element using index [2] (zero-based).")

    add(SUBJECT, "Locators", "Medium", "scenario",
        "You need to locate a dynamic element whose ID changes on each page load but its data-testid attribute remains constant. Which approach is best?",
        "By.CSS_SELECTOR with [data-testid='value']", "By.ID with the current ID", "By.TAG_NAME", "By.CLASS_NAME",
        "A", "Using CSS attribute selectors like [data-testid='value'] is reliable for elements with stable custom attributes.")

    add(SUBJECT, "Locators", "Hard", "scenario",
        "You need to find an element that is a child of a specific parent. The parent has id='form1'. Which XPath is most reliable?",
        "//div[@id='form1']//input", "/div[@id='form1']/input", "//input[@parent='form1']", "//div[@id='form1']+input",
        "A", "//div[@id='form1']//input uses descendant axis (//) to find input elements anywhere inside the parent div.")

    add(SUBJECT, "Locators", "Hard", "scenario",
        "A table has dynamically generated rows. You need to find all rows containing specific text. Which approach is most efficient?",
        "XPath: //tr[contains(., 'search text')]", "Iterate all rows with Python string matching", "Use By.LINK_TEXT on each row", "Use JavaScript to filter rows",
        "A", "XPath contains() with text matching on tr elements efficiently filters rows with specific text content.")

    add(SUBJECT, "Locators", "Easy", "scenario",
        "You see an element with name='email' on the page. Which locator would you use?",
        "By.NAME with value 'email'", "By.ID with value 'email'", "By.TEXT with value 'email'", "By.ATTRIBUTE with value 'email'",
        "A", "By.NAME matches elements by their name attribute, which is ideal when the name is known.")

    # Code Completion (5)
    add(SUBJECT, "Locators", "Easy", "code_completion",
        "Complete the code to find an element by its ID.",
        "By.ID, 'username'", "By.ELEMENT_ID, 'username'", "'id', 'username'", "id='username'",
        "A", "By.ID is the locator strategy for finding elements by their HTML id attribute.",
        "from selenium.webdriver.common.by import By\nelement = driver.find_element(___, ___)")

    add(SUBJECT, "Locators", "Medium", "code_completion",
        "Complete the CSS selector to find an input element inside a form with id 'loginForm'.",
        "'#loginForm input'", "'.loginForm input'", "'loginForm > input'", "'form#loginForm.input'",
        "A", "#loginForm input is a CSS selector targeting input elements inside the element with id loginForm.",
        "element = driver.find_element(By.CSS_SELECTOR, ___)")

    add(SUBJECT, "Locators", "Medium", "code_completion",
        "Complete the XPath to find a button element with text 'Submit'.",
        "\"//button[text()='Submit']\"", "\"//button[@text='Submit']\"", "\"//button{Submit}\"", "\"/button[text=Submit]\"",
        "A", "XPath text() function matches the text content of an element.",
        "element = driver.find_element(By.XPATH, ___)")

    add(SUBJECT, "Locators", "Hard", "code_completion",
        "Complete the XPath to find all elements whose class attribute contains 'nav-item'.",
        "\"//li[contains(@class, 'nav-item')]\"", "\"//li[@class~='nav-item']\"", "\"//li[has-class('nav-item')]\"", "\"//li[@class*='nav-item']\"",
        "A", "XPath contains(@class, 'nav-item') performs partial matching on the class attribute.",
        "elements = driver.find_elements(By.XPATH, ___)")

    add(SUBJECT, "Locators", "Hard", "code_completion",
        "Complete the code to find a sibling element using XPath.",
        "\"//div[@id='ref']/following-sibling::p\"", "\"//div[@id='ref']/next::p\"", "\"//div[@id='ref']+p\"", "\"//div[@id='ref']/sibling::p\"",
        "A", "following-sibling axis selects sibling nodes that come after the context node in document order.",
        "sibling = driver.find_element(By.XPATH, ___)")

    # ===================== WAITS =====================
    # MCQ (12)
    add(SUBJECT, "Waits", "Easy", "mcq",
        "What is an implicit wait in Selenium?",
        "A global wait that polls the DOM for a specified time before throwing NoSuchElementException",
        "A wait that pauses execution for a fixed duration",
        "A wait only for AJAX calls",
        "A wait triggered by JavaScript",
        "A", "Implicit wait tells the driver to poll the DOM for a certain time when finding elements.")

    add(SUBJECT, "Waits", "Easy", "mcq",
        "Which class implements explicit waits in Selenium?",
        "WebDriverWait", "ExplicitWait", "WaitFor", "SeleniumWait",
        "A", "WebDriverWait is the class used for explicit waits in Selenium.")

    add(SUBJECT, "Waits", "Easy", "mcq",
        "What module provides expected_conditions in Selenium?",
        "selenium.webdriver.support.expected_conditions", "selenium.conditions", "selenium.waits.conditions", "selenium.expected",
        "A", "Expected conditions are in selenium.webdriver.support.expected_conditions, commonly aliased as EC.")

    add(SUBJECT, "Waits", "Easy", "mcq",
        "What happens when an implicit wait times out?",
        "NoSuchElementException is raised", "None is returned", "The script continues", "A TimeoutException is raised",
        "A", "When implicit wait times out, find_element raises NoSuchElementException.")

    add(SUBJECT, "Waits", "Medium", "mcq",
        "Which expected condition waits until an element is clickable?",
        "EC.element_to_be_clickable(locator)", "EC.clickable(locator)", "EC.wait_clickable(locator)", "EC.is_clickable(locator)",
        "A", "element_to_be_clickable waits until the element is visible and enabled.")

    add(SUBJECT, "Waits", "Medium", "mcq",
        "What is the default polling interval for WebDriverWait?",
        "0.5 seconds", "1 second", "0.1 seconds", "2 seconds",
        "A", "WebDriverWait polls the DOM every 0.5 seconds by default.")

    add(SUBJECT, "Waits", "Medium", "mcq",
        "Which expected condition checks if an element is present in the DOM but not necessarily visible?",
        "EC.presence_of_element_located(locator)", "EC.element_exists(locator)", "EC.dom_contains(locator)", "EC.in_page(locator)",
        "A", "presence_of_element_located checks the DOM for the element regardless of visibility.")

    add(SUBJECT, "Waits", "Medium", "mcq",
        "Why is mixing implicit and explicit waits generally discouraged?",
        "It can cause unpredictable wait times", "It raises an exception", "Implicit waits override explicit waits", "Explicit waits disable implicit waits",
        "A", "Mixing both types can lead to unpredictable timeouts because they can stack.")

    add(SUBJECT, "Waits", "Hard", "mcq",
        "Which expected condition waits for an element to become invisible or removed from the DOM?",
        "EC.invisibility_of_element_located(locator)", "EC.element_hidden(locator)", "EC.not_visible(locator)", "EC.element_gone(locator)",
        "A", "invisibility_of_element_located returns True when the element is invisible or not present in the DOM.")

    add(SUBJECT, "Waits", "Hard", "mcq",
        "How do you create a custom expected condition in Selenium?",
        "Write a callable that returns False or a truthy value", "Subclass ExpectedCondition", "Register it with WebDriverWait", "Override the wait method",
        "A", "A custom expected condition is any callable (function or class with __call__) that takes the driver and returns False/truthy.")

    add(SUBJECT, "Waits", "Hard", "mcq",
        "What exception does WebDriverWait.until() raise when the timeout expires?",
        "TimeoutException", "NoSuchElementException", "WaitTimeoutError", "ElementNotFoundError",
        "A", "WebDriverWait.until() raises TimeoutException when the condition is not met within the timeout.")

    # Output (6)
    add(SUBJECT, "Waits", "Easy", "output",
        "What does this code do when the element with id 'msg' appears within 10 seconds?",
        "Returns the WebElement for 'msg'", "Raises TimeoutException", "Returns True", "Returns the text of the element",
        "A", "WebDriverWait.until() returns the element when the condition is satisfied.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.common.by import By\nwait = WebDriverWait(driver, 10)\nelement = wait.until(EC.presence_of_element_located((By.ID, 'msg')))\nprint(type(element).__name__)")

    add(SUBJECT, "Waits", "Medium", "output",
        "What will happen if the element is not found within 5 seconds?",
        "TimeoutException is raised", "Returns None", "Returns False", "NoSuchElementException is raised",
        "A", "When the condition is not met within the timeout, WebDriverWait raises TimeoutException.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.common.by import By\nwait = WebDriverWait(driver, 5)\nelement = wait.until(EC.visibility_of_element_located((By.ID, 'popup')))")

    add(SUBJECT, "Waits", "Medium", "output",
        "What does this code print when the title becomes 'Dashboard'?",
        "True", "Dashboard", "False", "None",
        "A", "EC.title_is returns True when the page title matches exactly.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nwait = WebDriverWait(driver, 10)\nresult = wait.until(EC.title_is('Dashboard'))\nprint(result)")

    add(SUBJECT, "Waits", "Hard", "output",
        "What does this custom wait condition do?",
        "Waits until the element has non-empty text, then returns the text", "Raises an error", "Returns True", "Returns the element",
        "A", "The lambda checks element text; once non-empty it returns the truthy text string.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.common.by import By\nwait = WebDriverWait(driver, 10)\nresult = wait.until(lambda d: d.find_element(By.ID, 'status').text or False)\nprint(result)")

    add(SUBJECT, "Waits", "Easy", "output",
        "What does this code configure?",
        "Sets a 10-second implicit wait for all find_element calls", "Sets a 10-second page load timeout", "Waits 10 seconds before starting", "Creates a 10-second explicit wait",
        "A", "implicitly_wait sets the global implicit wait timeout for element finding.",
        "driver.implicitly_wait(10)\nprint('Implicit wait set')")

    add(SUBJECT, "Waits", "Hard", "output",
        "What does this code return when the alert is present?",
        "An Alert object", "True", "The alert text", "None",
        "A", "EC.alert_is_present returns the Alert object when an alert is detected.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nwait = WebDriverWait(driver, 5)\nalert = wait.until(EC.alert_is_present())\nprint(type(alert).__name__)")

    # Scenario (6)
    add(SUBJECT, "Waits", "Easy", "scenario",
        "A page element loads via AJAX after 3 seconds. Which wait strategy is most appropriate?",
        "Explicit wait with WebDriverWait and expected_conditions", "time.sleep(5)", "Implicit wait of 10 seconds", "Retry loop with try/except",
        "A", "Explicit waits are the recommended approach for waiting for specific conditions like AJAX-loaded elements.")

    add(SUBJECT, "Waits", "Medium", "scenario",
        "You need to wait until a loading spinner disappears before interacting with the page. Which expected condition should you use?",
        "EC.invisibility_of_element_located()", "EC.element_to_be_clickable()", "EC.presence_of_element_located()", "EC.visibility_of()",
        "A", "invisibility_of_element_located waits until the spinner element is no longer visible.")

    add(SUBJECT, "Waits", "Medium", "scenario",
        "Your test intermittently fails because a button is present in the DOM but not yet clickable. How do you fix this?",
        "Use EC.element_to_be_clickable() instead of EC.presence_of_element_located()", "Add time.sleep(2)", "Increase implicit wait", "Use try/except to retry",
        "A", "element_to_be_clickable ensures the element is both visible and enabled before interacting.")

    add(SUBJECT, "Waits", "Hard", "scenario",
        "You need to wait for a page redirect after form submission. The URL should contain '/success'. Which approach is best?",
        "WebDriverWait with EC.url_contains('/success')", "time.sleep(5) then check URL", "Implicit wait and check URL", "Refresh and check URL",
        "A", "EC.url_contains waits efficiently until the URL includes the expected substring.")

    add(SUBJECT, "Waits", "Hard", "scenario",
        "A complex SPA takes variable time to load content. You need a custom wait condition that checks for a specific data attribute. How do you implement this?",
        "Pass a lambda or callable to WebDriverWait.until() that checks the data attribute",
        "Use EC.presence_of_element_located with the data attribute",
        "Use time.sleep with a large value",
        "Poll the page source in a while loop",
        "A", "WebDriverWait.until() accepts any callable, so a lambda checking the data attribute is the cleanest approach.")

    add(SUBJECT, "Waits", "Easy", "scenario",
        "Your test needs to wait for a page title to change to 'Welcome'. Which is the simplest approach?",
        "WebDriverWait with EC.title_is('Welcome')", "while driver.title != 'Welcome': pass", "time.sleep(10)", "driver.refresh() until title matches",
        "A", "EC.title_is provides a clean, built-in way to wait for a specific page title.")

    # Code Completion (5)
    add(SUBJECT, "Waits", "Easy", "code_completion",
        "Complete the explicit wait code to wait up to 10 seconds for an element to be visible.",
        "WebDriverWait(driver, 10); EC.visibility_of_element_located((By.ID, 'result'))", "Wait(driver, 10); EC.visible(By.ID, 'result')", "WebDriverWait(10); EC.element_visible('result')", "ExplicitWait(driver, 10); EC.is_visible(By.ID, 'result')",
        "A", "WebDriverWait with visibility_of_element_located waits for the element to become visible.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.common.by import By\nwait = ___\nelement = wait.until(___)")

    add(SUBJECT, "Waits", "Medium", "code_completion",
        "Complete the code to wait until the element is clickable and then click it.",
        "EC.element_to_be_clickable((By.ID, 'btn'))", "EC.clickable(By.ID, 'btn')", "EC.ready_to_click((By.ID, 'btn'))", "EC.can_click(By.ID, 'btn')",
        "A", "element_to_be_clickable waits until the element is visible and enabled.",
        "wait = WebDriverWait(driver, 10)\nbutton = wait.until(___)\nbutton.click()")

    add(SUBJECT, "Waits", "Medium", "code_completion",
        "Complete the code to set a custom polling interval of 1 second for WebDriverWait.",
        "WebDriverWait(driver, 10, poll_frequency=1)", "WebDriverWait(driver, 10, interval=1)", "WebDriverWait(driver, 10, poll=1)", "WebDriverWait(driver, 10).every(1)",
        "A", "The poll_frequency parameter sets how often the condition is checked.",
        "wait = ___\nelement = wait.until(EC.presence_of_element_located((By.ID, 'item')))")

    add(SUBJECT, "Waits", "Hard", "code_completion",
        "Complete the code to ignore StaleElementReferenceException during the wait.",
        "WebDriverWait(driver, 10, ignored_exceptions=[StaleElementReferenceException])", "WebDriverWait(driver, 10).ignore(StaleElementReferenceException)", "WebDriverWait(driver, 10, skip=[StaleElementReferenceException])", "WebDriverWait(driver, 10, suppress=StaleElementReferenceException)",
        "A", "The ignored_exceptions parameter tells WebDriverWait to suppress specific exceptions during polling.",
        "from selenium.common.exceptions import StaleElementReferenceException\nwait = ___\nelement = wait.until(EC.presence_of_element_located((By.ID, 'dynamic')))")

    add(SUBJECT, "Waits", "Hard", "code_completion",
        "Complete the custom expected condition that waits until element text equals a specific value.",
        "lambda d: d.find_element(By.ID, 'status').text == 'Complete'", "lambda: driver.find_element(By.ID, 'status').text == 'Complete'", "EC.text_equals('status', 'Complete')", "wait.text_is('status', 'Complete')",
        "A", "A lambda taking the driver and checking element text is a valid custom expected condition.",
        "wait = WebDriverWait(driver, 10)\nresult = wait.until(___)")

    # ===================== PAGE OBJECT MODEL =====================
    # MCQ (11)
    add(SUBJECT, "Page Object Model", "Easy", "mcq",
        "What is the Page Object Model (POM) design pattern?",
        "A pattern that creates a class for each web page to encapsulate page elements and interactions",
        "A built-in Selenium feature for page management",
        "A way to automatically generate page objects from HTML",
        "A testing framework for web pages",
        "A", "POM separates page structure/interactions into classes, improving test maintainability.")

    add(SUBJECT, "Page Object Model", "Easy", "mcq",
        "What is the main advantage of the Page Object Model?",
        "Reduces code duplication and improves maintainability", "Makes tests run faster", "Automatically handles waits", "Generates test reports",
        "A", "POM centralizes element locators and page interactions, so changes to the UI only require updates in one place.")

    add(SUBJECT, "Page Object Model", "Easy", "mcq",
        "In POM, where should element locators be defined?",
        "In the page class as class or instance attributes", "In the test functions", "In a global configuration file", "In the conftest.py",
        "A", "Locators are defined in the page class to centralize them and reduce duplication.")

    add(SUBJECT, "Page Object Model", "Medium", "mcq",
        "What should a Page Object method return?",
        "Either data from the page or a new Page Object for the resulting page", "Always return True or False", "Always return self", "Always return a WebElement",
        "A", "Page methods should return meaningful values or new Page Objects representing page transitions.")

    add(SUBJECT, "Page Object Model", "Medium", "mcq",
        "Which of the following is a best practice in POM?",
        "Page classes should not contain assertions", "Assertions should be in page classes", "Tests should directly use find_element", "One page class for the entire application",
        "A", "Assertions belong in test code, not in page objects, to maintain separation of concerns.")

    add(SUBJECT, "Page Object Model", "Medium", "mcq",
        "How should a login page object handle navigation to a dashboard after successful login?",
        "Return a DashboardPage object from the login method", "Navigate to dashboard in the test", "Store the dashboard URL in the login page", "Use a global page manager",
        "A", "Returning a new page object for page transitions follows POM best practices.")

    add(SUBJECT, "Page Object Model", "Medium", "mcq",
        "What is a Page Factory in the context of POM?",
        "A pattern to initialize page elements lazily using decorators or descriptors", "A tool that auto-generates page objects", "A Selenium built-in class", "A CI/CD component for testing",
        "A", "Page Factory initializes elements lazily, though it is more common in Java Selenium; in Python, similar patterns use descriptors.")

    add(SUBJECT, "Page Object Model", "Hard", "mcq",
        "How do you handle common elements like headers and footers across multiple pages in POM?",
        "Create a BasePage class with common elements and have page classes inherit from it", "Duplicate them in each page class", "Use a separate utility file", "Define them in conftest.py",
        "A", "A BasePage class with common elements and methods provides inheritance-based reuse.")

    add(SUBJECT, "Page Object Model", "Hard", "mcq",
        "What is a Component Object in the context of POM?",
        "A reusable object representing a UI component that appears on multiple pages", "A Selenium internal class", "A test fixture for components", "A page that contains only one element",
        "A", "Component Objects encapsulate reusable UI sections (e.g., navigation bars) that appear across pages.")

    add(SUBJECT, "Page Object Model", "Hard", "mcq",
        "Which approach best handles dynamic page elements that may or may not appear?",
        "Use try/except or explicit waits in the page object methods", "Ignore them", "Add time.sleep before checking", "Use implicit waits only",
        "A", "Try/except blocks or explicit waits in page methods gracefully handle optional dynamic elements.")

    add(SUBJECT, "Page Object Model", "Easy", "mcq",
        "In POM, what does the __init__ method of a page class typically receive?",
        "The WebDriver instance", "The page URL", "A list of locators", "The test configuration",
        "A", "Page objects receive the driver to perform element interactions and navigate the page.")

    # Output (5)
    add(SUBJECT, "Page Object Model", "Easy", "output",
        "What does this page object code structure represent?",
        "A login page with methods to enter credentials and click login", "A data class", "A test case", "A fixture",
        "A", "The class encapsulates login page elements and interactions following POM pattern.",
        "class LoginPage:\n    def __init__(self, driver):\n        self.driver = driver\n        self.username_input = (By.ID, 'username')\n        self.password_input = (By.ID, 'password')\n        self.login_button = (By.ID, 'login-btn')\n    def login(self, user, pwd):\n        self.driver.find_element(*self.username_input).send_keys(user)\n        self.driver.find_element(*self.password_input).send_keys(pwd)\n        self.driver.find_element(*self.login_button).click()\nprint('LoginPage defined')")

    add(SUBJECT, "Page Object Model", "Medium", "output",
        "What does the login method return in this POM implementation?",
        "A DashboardPage instance", "None", "True", "The driver",
        "A", "The login method returns a new DashboardPage, following POM best practice for page transitions.",
        "class LoginPage:\n    def __init__(self, driver):\n        self.driver = driver\n    def login(self, user, pwd):\n        self.driver.find_element(By.ID, 'username').send_keys(user)\n        self.driver.find_element(By.ID, 'password').send_keys(pwd)\n        self.driver.find_element(By.ID, 'login-btn').click()\n        return DashboardPage(self.driver)\nprint(LoginPage.login.__code__.co_names)")

    add(SUBJECT, "Page Object Model", "Medium", "output",
        "What does this BasePage class provide to subclasses?",
        "A common find_element method with explicit wait", "Nothing useful", "Automatic test execution", "Page URL management",
        "A", "The BasePage provides a reusable wait-and-find method that all page classes can inherit.",
        "class BasePage:\n    def __init__(self, driver):\n        self.driver = driver\n        self.wait = WebDriverWait(driver, 10)\n    def find(self, locator):\n        return self.wait.until(EC.presence_of_element_located(locator))\nprint('BasePage provides find with wait')")

    add(SUBJECT, "Page Object Model", "Hard", "output",
        "What pattern does this code demonstrate?",
        "Method chaining in POM (fluent interface)", "Builder pattern", "Singleton pattern", "Observer pattern",
        "A", "Returning self from methods enables method chaining (fluent interface) in page objects.",
        "class SearchPage:\n    def __init__(self, driver):\n        self.driver = driver\n    def enter_query(self, text):\n        self.driver.find_element(By.NAME, 'q').send_keys(text)\n        return self\n    def click_search(self):\n        self.driver.find_element(By.NAME, 'btnK').click()\n        return self\nprint('Fluent interface pattern')")

    add(SUBJECT, "Page Object Model", "Hard", "output",
        "What does this property-based locator pattern provide?",
        "Lazy element lookup - element is found each time the property is accessed", "Caching of elements", "Automatic retries", "Static element references",
        "A", "Using @property ensures the element is located fresh each time, avoiding stale references.",
        "class ProfilePage:\n    def __init__(self, driver):\n        self.driver = driver\n    @property\n    def name_field(self):\n        return self.driver.find_element(By.ID, 'name')\n    @property\n    def email_field(self):\n        return self.driver.find_element(By.ID, 'email')\nprint('Property-based lazy lookup')")

    # Scenario (6)
    add(SUBJECT, "Page Object Model", "Easy", "scenario",
        "You have 50 tests that interact with the login page. The login button ID changes. How many files do you need to update with POM?",
        "Only the LoginPage class file", "All 50 test files", "The conftest.py and all test files", "A global config file",
        "A", "With POM, the locator is defined once in the LoginPage class, so only one file needs updating.")

    add(SUBJECT, "Page Object Model", "Medium", "scenario",
        "A new modal dialog appears on multiple pages. How should you model this in POM?",
        "Create a ModalComponent class that can be composed into any page object", "Add modal methods to every page class", "Create a separate test for modals", "Ignore it in the page objects",
        "A", "A separate component class for the modal follows composition principles and avoids duplication.")

    add(SUBJECT, "Page Object Model", "Medium", "scenario",
        "Your e-commerce site has product listing and product detail pages. How should the transition from listing to detail be handled?",
        "The listing page click_product() method returns a ProductDetailPage object", "Navigate directly by URL", "Use a global page manager", "Store all pages in a dictionary",
        "A", "Returning a new page object on navigation maintains clean page transitions in POM.")

    add(SUBJECT, "Page Object Model", "Hard", "scenario",
        "Your application has a wizard with 5 steps. How should you model this in POM?",
        "Create a page class for each step, with next/previous methods returning the appropriate step page", "One page class with all 5 steps", "A single WizardPage with state tracking", "Five separate test files",
        "A", "Separate page classes for each step with transition methods provides clean separation and type safety.")

    add(SUBJECT, "Page Object Model", "Hard", "scenario",
        "You need to support both mobile and desktop versions of the same page with different locators. How do you handle this in POM?",
        "Create a base page class and mobile/desktop subclasses that override locators", "Use if/else in every method", "Create separate test suites", "Use JavaScript to detect device",
        "A", "Inheritance allows mobile/desktop subclasses to override locators while sharing common logic.")

    add(SUBJECT, "Page Object Model", "Easy", "scenario",
        "You are starting a new automation project. When should you create page objects?",
        "When writing the first test that interacts with a page", "After all tests are written", "Only when tests fail", "Only for complex pages",
        "A", "Page objects should be created as tests are written, building the POM layer incrementally.")

    # Code Completion (5)
    add(SUBJECT, "Page Object Model", "Easy", "code_completion",
        "Complete the page object constructor.",
        "self.driver = driver", "driver = self.driver", "self = driver", "self.browser = webdriver.Chrome()",
        "A", "The constructor stores the driver instance for use in page methods.",
        "class HomePage:\n    def __init__(self, driver):\n        ___\n        self.search_box = (By.ID, 'search')")

    add(SUBJECT, "Page Object Model", "Medium", "code_completion",
        "Complete the page object method to enter text in a search box and return self for chaining.",
        "self.driver.find_element(*self.search_box).send_keys(query); return self",
        "driver.find_element(self.search_box).send_keys(query)",
        "self.search_box.send_keys(query); return None",
        "find_element(self.search_box).type(query)",
        "A", "Unpacking the locator tuple with * and returning self enables method chaining.",
        "def search(self, query):\n    ___")

    add(SUBJECT, "Page Object Model", "Medium", "code_completion",
        "Complete the BasePage class to include a method that waits for and returns an element.",
        "self.wait.until(EC.visibility_of_element_located(locator))", "self.driver.find_element(locator)", "self.driver.get(locator)", "WebDriverWait.find(locator)",
        "A", "Using WebDriverWait with expected conditions provides reliable element location.",
        "class BasePage:\n    def __init__(self, driver):\n        self.driver = driver\n        self.wait = WebDriverWait(driver, 10)\n    def find_element(self, locator):\n        return ___")

    add(SUBJECT, "Page Object Model", "Hard", "code_completion",
        "Complete the page object to return a new page after form submission.",
        "return ConfirmationPage(self.driver)", "return self", "return True", "return self.driver.current_url",
        "A", "Returning a new page object for page transitions follows POM convention.",
        "class OrderPage(BasePage):\n    def submit_order(self):\n        self.driver.find_element(*self.submit_btn).click()\n        ___")

    add(SUBJECT, "Page Object Model", "Hard", "code_completion",
        "Complete the component object for a navigation bar.",
        "super().__init__(driver); self.nav_root = driver.find_element(By.ID, 'navbar')",
        "self.navbar = 'navbar'",
        "driver.find('navbar')",
        "BasePage.__init__(driver)",
        "A", "Calling super().__init__ and finding the component root element sets up the component.",
        "class NavBar(BasePage):\n    def __init__(self, driver):\n        ___\n    def click_home(self):\n        self.nav_root.find_element(By.LINK_TEXT, 'Home').click()")

    # ===================== ACTIONS =====================
    # MCQ (11)
    add(SUBJECT, "Actions", "Easy", "mcq",
        "Which class provides advanced user interaction methods like drag and drop?",
        "ActionChains", "UserActions", "MouseActions", "InteractionBuilder",
        "A", "ActionChains class provides methods for complex user interactions.")

    add(SUBJECT, "Actions", "Easy", "mcq",
        "How do you import ActionChains in Selenium?",
        "from selenium.webdriver.common.action_chains import ActionChains", "from selenium.actions import ActionChains", "import ActionChains", "from selenium import ActionChains",
        "A", "ActionChains is in selenium.webdriver.common.action_chains module.")

    add(SUBJECT, "Actions", "Easy", "mcq",
        "Which method must be called to execute the queued actions in ActionChains?",
        "perform()", "execute()", "run()", "submit()",
        "A", "perform() executes all actions queued in the ActionChains object.")

    add(SUBJECT, "Actions", "Medium", "mcq",
        "Which ActionChains method simulates hovering over an element?",
        "move_to_element(element)", "hover(element)", "mouse_over(element)", "focus(element)",
        "A", "move_to_element() moves the mouse to the center of the specified element, simulating hover.")

    add(SUBJECT, "Actions", "Medium", "mcq",
        "How do you perform a right-click using ActionChains?",
        "context_click(element)", "right_click(element)", "secondary_click(element)", "click(element, button='right')",
        "A", "context_click() performs a right-click (context menu click) on the element.")

    add(SUBJECT, "Actions", "Medium", "mcq",
        "Which method performs a double-click on an element?",
        "double_click(element)", "dblclick(element)", "click_twice(element)", "click(element, count=2)",
        "A", "double_click() simulates a mouse double-click on the element.")

    add(SUBJECT, "Actions", "Medium", "mcq",
        "How do you simulate holding down the Shift key while clicking?",
        "key_down(Keys.SHIFT).click(element).key_up(Keys.SHIFT)", "click(element, modifier='shift')", "shift_click(element)", "click(element, keys=[Keys.SHIFT])",
        "A", "key_down/key_up with click in between simulates modifier key combinations.")

    add(SUBJECT, "Actions", "Hard", "mcq",
        "Which method drags an element from source to target?",
        "drag_and_drop(source, target)", "move(source, target)", "drag(source).drop(target)", "transfer(source, target)",
        "A", "drag_and_drop() performs a click-and-hold on source, moves to target, and releases.")

    add(SUBJECT, "Actions", "Hard", "mcq",
        "How do you drag an element by a specific pixel offset?",
        "drag_and_drop_by_offset(element, xoffset, yoffset)", "drag_by_pixels(element, x, y)", "move_by(element, x, y)", "offset_drag(element, x, y)",
        "A", "drag_and_drop_by_offset moves an element by specified x and y pixel offsets.")

    add(SUBJECT, "Actions", "Hard", "mcq",
        "Which ActionChains method clicks and holds an element without releasing?",
        "click_and_hold(element)", "press(element)", "hold_click(element)", "mouse_down(element)",
        "A", "click_and_hold() presses and holds the left mouse button on an element.")

    add(SUBJECT, "Actions", "Easy", "mcq",
        "What does ActionChains(driver) create?",
        "A new ActionChains object bound to the driver", "A list of available actions", "A mouse controller", "A keyboard handler",
        "A", "ActionChains(driver) creates a new action chain associated with the given WebDriver instance.")

    # Output (5)
    add(SUBJECT, "Actions", "Easy", "output",
        "What does this code do?",
        "Moves the mouse to the menu element, triggering a hover effect", "Clicks the menu element", "Drags the menu element", "Scrolls to the menu element",
        "A", "move_to_element followed by perform() moves the mouse to the element, triggering hover events.",
        "from selenium.webdriver.common.action_chains import ActionChains\nmenu = driver.find_element(By.ID, 'menu')\nActionChains(driver).move_to_element(menu).perform()\nprint('Hovered over menu')")

    add(SUBJECT, "Actions", "Medium", "output",
        "What does this code do?",
        "Performs a right-click on the element, opening the context menu", "Performs a regular click", "Double-clicks the element", "Drags the element",
        "A", "context_click performs a right-click, typically opening a browser or custom context menu.",
        "from selenium.webdriver.common.action_chains import ActionChains\nelem = driver.find_element(By.ID, 'item')\nActionChains(driver).context_click(elem).perform()\nprint('Right-clicked')")

    add(SUBJECT, "Actions", "Medium", "output",
        "What sequence of actions does this code perform?",
        "Holds Ctrl, clicks three elements (selecting multiple), releases Ctrl", "Clicks three elements sequentially", "Right-clicks three elements", "Drags elements together",
        "A", "key_down(Keys.CONTROL) with multiple clicks simulates Ctrl+Click for multi-selection.",
        "from selenium.webdriver.common.action_chains import ActionChains\nfrom selenium.webdriver.common.keys import Keys\nactions = ActionChains(driver)\nactions.key_down(Keys.CONTROL)\nactions.click(elem1).click(elem2).click(elem3)\nactions.key_up(Keys.CONTROL)\nactions.perform()\nprint('Multi-select done')")

    add(SUBJECT, "Actions", "Hard", "output",
        "What does this code accomplish?",
        "Drags the source element and drops it on the target element", "Copies source to target", "Swaps source and target positions", "Deletes the source element",
        "A", "drag_and_drop clicks-and-holds source, moves to target, and releases.",
        "from selenium.webdriver.common.action_chains import ActionChains\nsource = driver.find_element(By.ID, 'drag')\ntarget = driver.find_element(By.ID, 'drop')\nActionChains(driver).drag_and_drop(source, target).perform()\nprint('Drag and drop completed')")

    add(SUBJECT, "Actions", "Hard", "output",
        "What does this code do?",
        "Moves the element 100 pixels right and 50 pixels down from its current position", "Moves the mouse to coordinates (100,50) on the page", "Resizes the element to 100x50", "Scrolls by 100,50 pixels",
        "A", "drag_and_drop_by_offset moves the element by the specified pixel offsets.",
        "from selenium.webdriver.common.action_chains import ActionChains\nslider = driver.find_element(By.ID, 'slider')\nActionChains(driver).drag_and_drop_by_offset(slider, 100, 50).perform()\nprint('Slider moved')")

    # Scenario (5)
    add(SUBJECT, "Actions", "Easy", "scenario",
        "You need to test a dropdown menu that only appears on mouse hover. Which ActionChains method should you use?",
        "move_to_element()", "click()", "hover()", "focus()",
        "A", "move_to_element() simulates mouse hover, which can trigger dropdown visibility.")

    add(SUBJECT, "Actions", "Medium", "scenario",
        "You need to select text in a paragraph by clicking at the start and shift-clicking at the end. How do you accomplish this?",
        "Click at start, then key_down(Keys.SHIFT).click(end_element).key_up(Keys.SHIFT).perform()",
        "Use select_text() method",
        "Use JavaScript to select text",
        "Use copy_text(start, end)",
        "A", "Shift+Click selects a range of text, simulated with key_down/key_up and click in ActionChains.")

    add(SUBJECT, "Actions", "Medium", "scenario",
        "A kanban board requires dragging cards between columns. Which ActionChains method is most appropriate?",
        "drag_and_drop(card_element, target_column_element)", "move_to_element(card).click(column)", "click_and_hold(card).move(column)", "drag(card, column)",
        "A", "drag_and_drop handles the complete drag-and-drop workflow between two elements.")

    add(SUBJECT, "Actions", "Hard", "scenario",
        "A slider control requires precise positioning. You need to drag it exactly 150 pixels to the right. Which method is best?",
        "drag_and_drop_by_offset(slider, 150, 0)", "drag_and_drop(slider, target)", "move_to_element_with_offset(slider, 150, 0)", "click_at_position(slider, 150, 0)",
        "A", "drag_and_drop_by_offset allows precise pixel-level control of element movement.")

    add(SUBJECT, "Actions", "Hard", "scenario",
        "You need to draw on an HTML5 canvas by simulating mouse movement. Which sequence of actions is correct?",
        "click_and_hold at start, move_by_offset for each point, release().perform()",
        "click at each point sequentially",
        "Use draw() method on canvas element",
        "Use JavaScript canvas API directly",
        "A", "Click-and-hold followed by move_by_offset traces a path, simulating drawing on a canvas.")

    # Code Completion (5)
    add(SUBJECT, "Actions", "Easy", "code_completion",
        "Complete the code to hover over a navigation menu item.",
        "ActionChains(driver).move_to_element(menu_item).perform()", "ActionChains(driver).hover(menu_item).perform()", "driver.hover(menu_item)", "ActionChains.move(menu_item)",
        "A", "move_to_element moves the mouse to the element center, simulating hover.",
        "from selenium.webdriver.common.action_chains import ActionChains\nmenu_item = driver.find_element(By.ID, 'nav-products')\n___")

    add(SUBJECT, "Actions", "Medium", "code_completion",
        "Complete the code to perform a double-click on a table cell.",
        "ActionChains(driver).double_click(cell).perform()", "ActionChains(driver).dblclick(cell).perform()", "cell.double_click()", "driver.double_click(cell)",
        "A", "double_click on ActionChains performs a double-click on the element.",
        "cell = driver.find_element(By.CSS_SELECTOR, 'td.editable')\n___")

    add(SUBJECT, "Actions", "Medium", "code_completion",
        "Complete the drag and drop code.",
        "ActionChains(driver).drag_and_drop(source, target).perform()", "ActionChains(driver).move(source, target).perform()", "driver.drag(source, target)", "source.drag_to(target)",
        "A", "drag_and_drop takes source and target elements and performs the complete operation.",
        "source = driver.find_element(By.ID, 'draggable')\ntarget = driver.find_element(By.ID, 'droppable')\n___")

    add(SUBJECT, "Actions", "Hard", "code_completion",
        "Complete the code to perform Ctrl+A (select all) using ActionChains.",
        "ActionChains(driver).key_down(Keys.CONTROL).send_keys('a').key_up(Keys.CONTROL).perform()",
        "ActionChains(driver).send_keys(Keys.CONTROL + 'a').perform()",
        "driver.select_all()",
        "ActionChains(driver).ctrl('a').perform()",
        "A", "key_down/send_keys/key_up sequence simulates keyboard shortcuts with modifier keys.",
        "from selenium.webdriver.common.keys import Keys\nfrom selenium.webdriver.common.action_chains import ActionChains\n___")

    add(SUBJECT, "Actions", "Hard", "code_completion",
        "Complete the code to click and hold, move by offset, then release.",
        "ActionChains(driver).click_and_hold(elem).move_by_offset(200, 0).release().perform()",
        "ActionChains(driver).hold(elem).move(200, 0).drop().perform()",
        "driver.click_hold(elem).move(200,0).release()",
        "ActionChains(driver).press(elem).offset(200,0).unpress().perform()",
        "A", "click_and_hold, move_by_offset, and release chain together for precise drag operations.",
        "elem = driver.find_element(By.ID, 'resizer')\n___")

    # ===================== SELECT =====================
    # MCQ (10)
    add(SUBJECT, "Select", "Easy", "mcq",
        "Which class is used to interact with HTML <select> dropdown elements?",
        "Select", "Dropdown", "OptionList", "SelectElement",
        "A", "The Select class from selenium.webdriver.support.select handles HTML select elements.")

    add(SUBJECT, "Select", "Easy", "mcq",
        "How do you import the Select class?",
        "from selenium.webdriver.support.select import Select", "from selenium.select import Select", "from selenium import Select", "import Select",
        "A", "The Select class is in selenium.webdriver.support.select module.")

    add(SUBJECT, "Select", "Easy", "mcq",
        "Which method selects an option by its visible text?",
        "select_by_visible_text()", "select_by_text()", "select_by_label()", "choose_text()",
        "A", "select_by_visible_text() selects the option whose displayed text matches.")

    add(SUBJECT, "Select", "Medium", "mcq",
        "Which method selects an option by its value attribute?",
        "select_by_value()", "select_by_attribute('value')", "set_value()", "choose_value()",
        "A", "select_by_value() selects the option whose value attribute matches the argument.")

    add(SUBJECT, "Select", "Medium", "mcq",
        "Which method selects an option by its position (zero-based)?",
        "select_by_index()", "select_by_position()", "select(index)", "choose_index()",
        "A", "select_by_index() selects the option at the given zero-based index position.")

    add(SUBJECT, "Select", "Medium", "mcq",
        "What does Select(element).options return?",
        "A list of all option WebElements", "A list of option text strings", "A list of option values", "The selected option",
        "A", "The options property returns all option WebElements in the select element.")

    add(SUBJECT, "Select", "Medium", "mcq",
        "How do you get the currently selected option in a dropdown?",
        "select.first_selected_option", "select.selected_option", "select.current_option", "select.get_selected()",
        "A", "first_selected_option returns the first currently selected option WebElement.")

    add(SUBJECT, "Select", "Hard", "mcq",
        "What exception is raised when Select is used on a non-select element?",
        "UnexpectedTagNameException", "InvalidElementException", "SelectError", "TagNameException",
        "A", "Select raises UnexpectedTagNameException if the element is not a <select> tag.")

    add(SUBJECT, "Select", "Hard", "mcq",
        "Which method deselects all options in a multi-select dropdown?",
        "deselect_all()", "clear_selection()", "unselect_all()", "reset()",
        "A", "deselect_all() clears all selected options in a multi-select element.")

    add(SUBJECT, "Select", "Hard", "mcq",
        "What does all_selected_options return on a multi-select element?",
        "A list of all currently selected option WebElements", "A list of text strings", "A single WebElement", "A boolean",
        "A", "all_selected_options returns a list of all option WebElements that are currently selected.")

    # Output (6)
    add(SUBJECT, "Select", "Easy", "output",
        "What does this code print for a dropdown with options: Apple, Banana, Cherry?",
        "3", "Apple", "[Apple, Banana, Cherry]", "A list of WebElements",
        "A", "select.options returns all option elements, and len() gives the count.",
        "from selenium.webdriver.support.select import Select\nselect = Select(driver.find_element(By.ID, 'fruits'))\nprint(len(select.options))")

    add(SUBJECT, "Select", "Medium", "output",
        "What does this code print after selecting 'Banana' from the dropdown?",
        "Banana", "banana", "1", "The option element",
        "A", "first_selected_option.text returns the visible text of the selected option.",
        "from selenium.webdriver.support.select import Select\nselect = Select(driver.find_element(By.ID, 'fruits'))\nselect.select_by_visible_text('Banana')\nprint(select.first_selected_option.text)")

    add(SUBJECT, "Select", "Medium", "output",
        "What does this code output?",
        "The value attribute of the first selected option", "The text of the selected option", "The index of the selected option", "The option tag name",
        "A", "get_attribute('value') returns the value attribute of the selected option element.",
        "from selenium.webdriver.support.select import Select\nselect = Select(driver.find_element(By.ID, 'country'))\nprint(select.first_selected_option.get_attribute('value'))")

    add(SUBJECT, "Select", "Hard", "output",
        "What does this code do with a multi-select dropdown?",
        "Selects three options and prints the count of selected options", "Selects only the last option", "Raises an error", "Deselects all options",
        "A", "Multiple select_by_index calls add selections in a multi-select, and all_selected_options returns all selected.",
        "from selenium.webdriver.support.select import Select\nselect = Select(driver.find_element(By.ID, 'multi'))\nselect.select_by_index(0)\nselect.select_by_index(2)\nselect.select_by_index(4)\nprint(len(select.all_selected_options))")

    add(SUBJECT, "Select", "Hard", "output",
        "What happens when this code runs on a non-select element like a div?",
        "Raises UnexpectedTagNameException", "Returns None", "Creates a Select object successfully", "Raises NoSuchElementException",
        "A", "The Select class only works with <select> elements and raises UnexpectedTagNameException otherwise.",
        "from selenium.webdriver.support.select import Select\ntry:\n    select = Select(driver.find_element(By.ID, 'mydiv'))\nexcept Exception as e:\n    print(type(e).__name__)")

    add(SUBJECT, "Select", "Easy", "output",
        "What does this code print?",
        "The visible text of all options as a list", "A list of WebElements", "The number of options", "The first option only",
        "A", "List comprehension extracts the text from each option WebElement.",
        "from selenium.webdriver.support.select import Select\nselect = Select(driver.find_element(By.ID, 'colors'))\nprint([opt.text for opt in select.options])")

    # Scenario (5)
    add(SUBJECT, "Select", "Easy", "scenario",
        "You need to select 'United States' from a country dropdown. The visible text shows 'United States' and the value attribute is 'US'. Which method is easiest?",
        "select_by_visible_text('United States')", "select_by_value('United States')", "select_by_index('US')", "click on the option element",
        "A", "select_by_visible_text matches the displayed option text, which is most readable.")

    add(SUBJECT, "Select", "Medium", "scenario",
        "A dropdown has options loaded dynamically via AJAX. How should you handle this?",
        "Use an explicit wait for the options to appear, then use Select", "Use time.sleep before selecting", "Use implicit wait only", "Try selecting in a while loop",
        "A", "An explicit wait ensures the dropdown options are loaded before creating the Select object.")

    add(SUBJECT, "Select", "Medium", "scenario",
        "You need to verify that a dropdown has exactly 5 options. How do you check this?",
        "len(Select(element).options) == 5", "Select(element).count() == 5", "Select(element).size == 5", "len(element.find_elements(By.OPTION)) == 5",
        "A", "Select.options returns all option elements, and len() gives the count.")

    add(SUBJECT, "Select", "Hard", "scenario",
        "A custom dropdown is implemented with div/ul/li elements instead of <select>. How should you handle it?",
        "Click the trigger element, wait for options to appear, then click the desired option li element",
        "Use Select class on the div",
        "Use select_by_visible_text on the div",
        "Convert the div to a select with JavaScript",
        "A", "Custom dropdowns require manual click interactions since the Select class only works with <select> elements.")

    add(SUBJECT, "Select", "Hard", "scenario",
        "You need to select multiple options in a multi-select dropdown and then deselect one. What sequence of operations is correct?",
        "select_by_value for each option, then deselect_by_value for the one to remove",
        "Select all at once with select_all, then deselect one",
        "Click each option, then Ctrl+Click to deselect",
        "Use JavaScript to set selected property",
        "A", "The Select class provides both select_by_value and deselect_by_value methods for multi-select management.")

    # Code Completion (5)
    add(SUBJECT, "Select", "Easy", "code_completion",
        "Complete the code to select an option by visible text.",
        "Select(dropdown); select.select_by_visible_text('Option 1')",
        "Select(dropdown); select.choose('Option 1')",
        "Dropdown(dropdown); select.text('Option 1')",
        "Select(dropdown); select.pick('Option 1')",
        "A", "Select wraps the element, and select_by_visible_text selects by displayed text.",
        "from selenium.webdriver.support.select import Select\ndropdown = driver.find_element(By.ID, 'myselect')\nselect = ___\n___")

    add(SUBJECT, "Select", "Medium", "code_completion",
        "Complete the code to get the text of all options in a dropdown.",
        "[option.text for option in select.options]", "select.get_all_text()", "select.options.text", "[o.value for o in select.all]",
        "A", "List comprehension over select.options extracting .text gives all option texts.",
        "select = Select(driver.find_element(By.ID, 'menu'))\noption_texts = ___")

    add(SUBJECT, "Select", "Medium", "code_completion",
        "Complete the code to select the third option by index.",
        "select.select_by_index(2)", "select.select_by_index(3)", "select.select(2)", "select.choose_index(3)",
        "A", "select_by_index uses zero-based indexing, so index 2 selects the third option.",
        "select = Select(driver.find_element(By.ID, 'items'))\n___")

    add(SUBJECT, "Select", "Hard", "code_completion",
        "Complete the code to deselect all options and then select two specific ones.",
        "select.deselect_all(); select.select_by_value('opt1'); select.select_by_value('opt3')",
        "select.clear(); select.add('opt1'); select.add('opt3')",
        "select.reset(); select.pick('opt1'); select.pick('opt3')",
        "select.unselect_all(); select.check('opt1'); select.check('opt3')",
        "A", "deselect_all clears all selections, then select_by_value picks specific options.",
        "select = Select(driver.find_element(By.ID, 'multi-select'))\n___")

    add(SUBJECT, "Select", "Hard", "code_completion",
        "Complete the code to verify the currently selected option text.",
        "select.first_selected_option.text", "select.selected.text", "select.current_text()", "select.get_selected_text()",
        "A", "first_selected_option returns the selected option WebElement, and .text gives its visible text.",
        "select = Select(driver.find_element(By.ID, 'priority'))\nselected_text = ___\nassert selected_text == 'High'")

    # ===================== FRAMES =====================
    # MCQ (10)
    add(SUBJECT, "Frames", "Easy", "mcq",
        "Which method switches the driver's focus to an iframe?",
        "driver.switch_to.frame()", "driver.enter_frame()", "driver.focus_frame()", "driver.goto_frame()",
        "A", "driver.switch_to.frame() changes the driver's context to the specified iframe.")

    add(SUBJECT, "Frames", "Easy", "mcq",
        "How do you switch back to the main page from an iframe?",
        "driver.switch_to.default_content()", "driver.switch_to.main()", "driver.exit_frame()", "driver.switch_to.parent()",
        "A", "default_content() switches back to the top-level document.")

    add(SUBJECT, "Frames", "Easy", "mcq",
        "Which of these is a valid argument to switch_to.frame()?",
        "All of the above: index, name/id string, or WebElement", "Only an index", "Only a name string", "Only a WebElement",
        "A", "switch_to.frame accepts an integer index, a name/id string, or a WebElement reference.")

    add(SUBJECT, "Frames", "Medium", "mcq",
        "What does driver.switch_to.parent_frame() do?",
        "Switches to the parent frame of the current frame", "Switches to the main document", "Switches to the first frame", "Closes the current frame",
        "A", "parent_frame() moves up one level in the frame hierarchy.")

    add(SUBJECT, "Frames", "Medium", "mcq",
        "What happens if you try to interact with an element inside an iframe without switching to it?",
        "NoSuchElementException is raised", "The element is found but not clickable", "The click happens on the parent page", "An iframe error is logged",
        "A", "Elements inside iframes are not accessible until the driver switches to that frame's context.")

    add(SUBJECT, "Frames", "Medium", "mcq",
        "How do you switch to a frame by its name attribute?",
        "driver.switch_to.frame('frameName')", "driver.switch_to.frame(name='frameName')", "driver.focus('frameName')", "driver.frame('frameName')",
        "A", "Passing the frame's name or id as a string to switch_to.frame() switches to that frame.")

    add(SUBJECT, "Frames", "Hard", "mcq",
        "How do you handle nested iframes (an iframe inside another iframe)?",
        "Switch to the outer frame first, then switch to the inner frame", "Switch directly to the inner frame by name", "Use switch_to.nested_frame()", "Use XPath to find nested frame elements",
        "A", "You must switch to each frame level sequentially to reach a nested iframe.")

    add(SUBJECT, "Frames", "Hard", "mcq",
        "Which approach is most reliable for switching to a dynamically loaded iframe?",
        "Use WebDriverWait to wait for the frame to be available, then switch", "Use time.sleep before switching", "Try switching in a loop", "Use JavaScript to access the frame",
        "A", "EC.frame_to_be_available_and_switch_to_it waits for the frame and switches automatically.")

    add(SUBJECT, "Frames", "Hard", "mcq",
        "What is the expected_condition for waiting until a frame is available?",
        "EC.frame_to_be_available_and_switch_to_it()", "EC.frame_available()", "EC.iframe_ready()", "EC.frame_loaded()",
        "A", "frame_to_be_available_and_switch_to_it waits for the frame and switches to it.")

    add(SUBJECT, "Frames", "Easy", "mcq",
        "How do you switch to the first iframe on the page using its index?",
        "driver.switch_to.frame(0)", "driver.switch_to.frame(1)", "driver.switch_to.frame('first')", "driver.enter_frame(0)",
        "A", "Frame indices are zero-based, so 0 refers to the first iframe on the page.")

    # Output (5)
    add(SUBJECT, "Frames", "Easy", "output",
        "What does this code accomplish?",
        "Switches to the iframe, gets text from an element inside it, then returns to the main page",
        "Gets text from the main page", "Creates a new frame", "Removes the iframe",
        "A", "The code switches context to the iframe, interacts with it, then returns to the main document.",
        "driver.switch_to.frame('content-frame')\ntext = driver.find_element(By.ID, 'inner-text').text\ndriver.switch_to.default_content()\nprint(text)")

    add(SUBJECT, "Frames", "Medium", "output",
        "What is the output of this code for a page with 3 iframes?",
        "3", "A list of iframe elements", "True", "The first iframe",
        "A", "find_elements returns all matching iframe/frame elements, and len() gives the count.",
        "iframes = driver.find_elements(By.TAG_NAME, 'iframe')\nprint(len(iframes))")

    add(SUBJECT, "Frames", "Medium", "output",
        "What does this code do with nested frames?",
        "Switches to outer frame, then to the inner frame nested inside it",
        "Switches to two frames simultaneously", "Raises an error", "Switches to inner frame directly",
        "A", "Sequential switch_to.frame calls navigate through the frame hierarchy.",
        "driver.switch_to.frame('outer')\ndriver.switch_to.frame('inner')\nprint('Now in nested frame')")

    add(SUBJECT, "Frames", "Hard", "output",
        "What does this code print?",
        "Switched to frame successfully", "An error message", "None", "The frame name",
        "A", "WebDriverWait with frame_to_be_available_and_switch_to_it waits for the frame before switching.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\ntry:\n    WebDriverWait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it('myframe'))\n    print('Switched to frame successfully')\nexcept:\n    print('Frame not found')")

    add(SUBJECT, "Frames", "Hard", "output",
        "What does this code return?",
        "The page source HTML of the content inside the iframe", "The parent page source", "An error", "The iframe element itself",
        "A", "After switching to the frame, page_source returns the HTML of the frame's document.",
        "driver.switch_to.frame(0)\nsource = driver.page_source\ndriver.switch_to.default_content()\nprint(type(source))")

    # Scenario (5)
    add(SUBJECT, "Frames", "Easy", "scenario",
        "A web page has an embedded video player inside an iframe. You need to click the play button. What must you do first?",
        "Switch to the iframe containing the video player", "Find the play button directly", "Use JavaScript to click play", "Wait for the video to load",
        "A", "You must switch to the iframe context before you can interact with elements inside it.")

    add(SUBJECT, "Frames", "Medium", "scenario",
        "An iframe loads dynamically after a user action. Your test fails with NoSuchFrameException. How do you fix this?",
        "Add an explicit wait for the frame to be available using EC.frame_to_be_available_and_switch_to_it",
        "Add time.sleep(5)", "Use a try/except retry loop", "Switch by index instead of name",
        "A", "An explicit wait for the frame ensures it is loaded and available before attempting to switch.")

    add(SUBJECT, "Frames", "Medium", "scenario",
        "After interacting with elements in an iframe, you need to click a button on the parent page. What should you do?",
        "Switch back to the default content or parent frame before clicking", "Click the button directly", "Use JavaScript to access the parent", "Open a new window",
        "A", "You must switch back to the appropriate context (default_content or parent_frame) to access elements outside the iframe.")

    add(SUBJECT, "Frames", "Hard", "scenario",
        "A page has three levels of nested iframes. You need to interact with an element in the innermost frame. What is the correct approach?",
        "Switch to frame level 1, then level 2, then level 3 sequentially",
        "Switch directly to the innermost frame", "Use XPath to cross frame boundaries", "Use JavaScript to bypass frames",
        "A", "You must navigate through each frame level sequentially to reach deeply nested iframes.")

    add(SUBJECT, "Frames", "Hard", "scenario",
        "You need to interact with elements in two different iframes on the same page. What is the workflow?",
        "Switch to first iframe, interact, switch to default_content, then switch to second iframe",
        "Switch between iframes directly", "Open both iframes in new tabs", "Use parallel threads for each iframe",
        "A", "You must return to the default content between iframe switches to change context correctly.")

    # Code Completion (5)
    add(SUBJECT, "Frames", "Easy", "code_completion",
        "Complete the code to switch to an iframe and interact with an element inside it.",
        "driver.switch_to.frame('login-frame')", "driver.enter_frame('login-frame')", "driver.focus('login-frame')", "driver.goto_frame('login-frame')",
        "A", "switch_to.frame with the frame name switches the driver context to that iframe.",
        "___\ndriver.find_element(By.ID, 'email').send_keys('test@example.com')\ndriver.switch_to.default_content()")

    add(SUBJECT, "Frames", "Medium", "code_completion",
        "Complete the code to switch to a frame using a WebElement reference.",
        "driver.find_element(By.CSS_SELECTOR, 'iframe.content'); driver.switch_to.frame(frame_elem)",
        "driver.find_frame('iframe.content'); driver.enter(frame_elem)",
        "driver.locate('iframe.content'); driver.switch(frame_elem)",
        "driver.get_frame('iframe.content'); driver.activate(frame_elem)",
        "A", "You can pass a WebElement to switch_to.frame for precise frame switching.",
        "frame_elem = ___\n___")

    add(SUBJECT, "Frames", "Medium", "code_completion",
        "Complete the code to wait for a frame and switch to it.",
        "EC.frame_to_be_available_and_switch_to_it('data-frame')", "EC.frame_ready('data-frame')", "EC.iframe_available('data-frame')", "EC.switch_frame('data-frame')",
        "A", "This expected condition waits for the frame to load and automatically switches to it.",
        "wait = WebDriverWait(driver, 10)\nwait.until(___)")

    add(SUBJECT, "Frames", "Hard", "code_completion",
        "Complete the code to handle nested iframes.",
        "driver.switch_to.frame('outer-frame'); driver.switch_to.frame('inner-frame')",
        "driver.switch_to.nested_frame('outer-frame', 'inner-frame')",
        "driver.switch_to.frame('outer-frame/inner-frame')",
        "driver.enter_frames(['outer-frame', 'inner-frame'])",
        "A", "Sequential switch_to.frame calls navigate the frame hierarchy one level at a time.",
        "___\n___\nelement = driver.find_element(By.ID, 'deep-element')")

    add(SUBJECT, "Frames", "Hard", "code_completion",
        "Complete the code to switch back to the parent frame (one level up).",
        "driver.switch_to.parent_frame()", "driver.switch_to.default_content()", "driver.frame_up()", "driver.parent()",
        "A", "parent_frame() moves up exactly one frame level, unlike default_content which goes to the top.",
        "driver.switch_to.frame('outer')\ndriver.switch_to.frame('inner')\n# interact with inner frame elements\n___\n# now in outer frame context")

    # ===================== ALERTS =====================
    # MCQ (10)
    add(SUBJECT, "Alerts", "Easy", "mcq",
        "How do you switch to a JavaScript alert in Selenium?",
        "driver.switch_to.alert", "driver.get_alert()", "driver.alert()", "driver.find_alert()",
        "A", "driver.switch_to.alert returns an Alert object for the current JavaScript alert.")

    add(SUBJECT, "Alerts", "Easy", "mcq",
        "Which method accepts (clicks OK on) a JavaScript alert?",
        "alert.accept()", "alert.ok()", "alert.confirm()", "alert.close()",
        "A", "alert.accept() clicks the OK button on an alert dialog.")

    add(SUBJECT, "Alerts", "Easy", "mcq",
        "Which method dismisses (clicks Cancel on) a JavaScript confirm dialog?",
        "alert.dismiss()", "alert.cancel()", "alert.reject()", "alert.close()",
        "A", "alert.dismiss() clicks the Cancel button on a confirm dialog.")

    add(SUBJECT, "Alerts", "Medium", "mcq",
        "How do you get the text of a JavaScript alert?",
        "alert.text", "alert.get_text()", "alert.message", "alert.content",
        "A", "The text property of the Alert object returns the message displayed in the alert.")

    add(SUBJECT, "Alerts", "Medium", "mcq",
        "How do you send text to a JavaScript prompt dialog?",
        "alert.send_keys('text')", "alert.type('text')", "alert.enter('text')", "alert.set_text('text')",
        "A", "alert.send_keys() types text into a prompt dialog's input field.")

    add(SUBJECT, "Alerts", "Medium", "mcq",
        "What exception is raised if you try to switch to an alert when none is present?",
        "NoAlertPresentException", "AlertNotFoundException", "NoSuchAlertException", "AlertError",
        "A", "NoAlertPresentException is raised when switch_to.alert is called with no active alert.")

    add(SUBJECT, "Alerts", "Hard", "mcq",
        "Which expected condition waits for an alert to appear?",
        "EC.alert_is_present()", "EC.alert_available()", "EC.has_alert()", "EC.wait_alert()",
        "A", "alert_is_present() returns the Alert object when a JavaScript alert is detected.")

    add(SUBJECT, "Alerts", "Hard", "mcq",
        "What is the difference between alert, confirm, and prompt JavaScript dialogs?",
        "Alert has OK only; Confirm has OK/Cancel; Prompt has input field with OK/Cancel",
        "They are all identical", "Alert has Cancel; Confirm has OK; Prompt has both",
        "There is no difference in Selenium handling",
        "A", "Each dialog type has different buttons/inputs, but Selenium handles them all through the Alert class.")

    add(SUBJECT, "Alerts", "Hard", "mcq",
        "Can Selenium interact with browser-native authentication dialogs?",
        "Not directly, but you can pass credentials in the URL or use third-party tools",
        "Yes, using switch_to.alert", "Yes, using driver.authenticate()", "No, it is impossible",
        "A", "Browser-native auth dialogs are not standard JavaScript alerts; workarounds like URL credentials are needed.")

    add(SUBJECT, "Alerts", "Medium", "mcq",
        "What happens if you try to interact with the page while an alert is active?",
        "UnhandledAlertException is raised", "The alert is automatically dismissed", "The interaction is queued", "Nothing happens",
        "A", "An active alert blocks page interaction; UnhandledAlertException is raised if you try.")

    # Output (5)
    add(SUBJECT, "Alerts", "Easy", "output",
        "What does this code print for an alert with message 'Are you sure?'?",
        "Are you sure?", "True", "Alert object", "None",
        "A", "alert.text returns the message text displayed in the alert dialog.",
        "alert = driver.switch_to.alert\nprint(alert.text)\nalert.accept()")

    add(SUBJECT, "Alerts", "Medium", "output",
        "What happens after this code executes on a confirm dialog?",
        "The dialog is dismissed (Cancel clicked) and the page continues", "The dialog is accepted", "An error occurs", "The page refreshes",
        "A", "alert.dismiss() clicks Cancel on the confirm dialog.",
        "alert = driver.switch_to.alert\nprint(alert.text)\nalert.dismiss()\nprint('Dialog dismissed')")

    add(SUBJECT, "Alerts", "Medium", "output",
        "What does this code do with a prompt dialog?",
        "Types 'John' into the prompt input and clicks OK", "Only types 'John' without confirming", "Dismisses the prompt", "Clears the prompt text",
        "A", "send_keys enters text and accept() confirms the prompt dialog.",
        "alert = driver.switch_to.alert\nalert.send_keys('John')\nalert.accept()\nprint('Prompt answered')")

    add(SUBJECT, "Alerts", "Hard", "output",
        "What does this code print when an alert appears within 5 seconds?",
        "The alert text", "True", "Alert", "TimeoutException",
        "A", "EC.alert_is_present returns the Alert object, and .text gives the alert message.",
        "from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nalert = WebDriverWait(driver, 5).until(EC.alert_is_present())\nprint(alert.text)\nalert.accept()")

    add(SUBJECT, "Alerts", "Hard", "output",
        "What does this code print when no alert is present?",
        "NoAlertPresentException", "None", "False", "An empty string",
        "A", "Accessing switch_to.alert without an active alert raises NoAlertPresentException.",
        "try:\n    alert = driver.switch_to.alert\n    print(alert.text)\nexcept Exception as e:\n    print(type(e).__name__)")

    # Scenario (5)
    add(SUBJECT, "Alerts", "Easy", "scenario",
        "A confirmation dialog asks 'Delete this item?'. You need to click Cancel. Which method do you use?",
        "alert.dismiss()", "alert.accept()", "alert.cancel()", "alert.close()",
        "A", "dismiss() clicks Cancel on a confirm dialog to prevent the action.")

    add(SUBJECT, "Alerts", "Medium", "scenario",
        "An alert appears after an AJAX request completes. Your test fails because it tries to handle the alert before it appears. How do you fix this?",
        "Use WebDriverWait with EC.alert_is_present() before switching to the alert",
        "Add time.sleep(3)", "Use try/except in a loop", "Handle it in JavaScript",
        "A", "Explicit wait with alert_is_present ensures the alert has appeared before handling it.")

    add(SUBJECT, "Alerts", "Medium", "scenario",
        "A prompt dialog requires entering a filename before download. How should your test handle this?",
        "Switch to alert, send_keys with the filename, then accept()",
        "Use driver.type() to enter the filename",
        "Dismiss the dialog and enter the filename elsewhere",
        "Use JavaScript to bypass the prompt",
        "A", "The Alert object's send_keys enters text into the prompt, and accept() confirms it.")

    add(SUBJECT, "Alerts", "Hard", "scenario",
        "Your application uses custom modal dialogs (not JavaScript alerts) that look like alerts. How should you handle them?",
        "Interact with them as regular web elements using find_element and click",
        "Use driver.switch_to.alert", "Use alert.accept()", "Use EC.alert_is_present()",
        "A", "Custom modal dialogs are regular HTML elements and should be interacted with using standard WebElement methods.")

    add(SUBJECT, "Alerts", "Hard", "scenario",
        "Multiple alerts appear in sequence after a batch operation. How do you handle all of them?",
        "Use a loop with switch_to.alert and accept/dismiss until NoAlertPresentException is raised",
        "Accept only the first alert", "Use driver.dismiss_all_alerts()", "Refresh the page to clear all alerts",
        "A", "Looping over switch_to.alert with a try/except for NoAlertPresentException handles sequential alerts.")

    # Code Completion (5)
    add(SUBJECT, "Alerts", "Easy", "code_completion",
        "Complete the code to accept a JavaScript alert.",
        "driver.switch_to.alert; alert.accept()",
        "driver.get_alert(); alert.ok()",
        "driver.find_alert(); alert.close()",
        "driver.alert(); alert.confirm()",
        "A", "switch_to.alert gets the Alert object and accept() clicks OK.",
        "alert = ___\n___")

    add(SUBJECT, "Alerts", "Medium", "code_completion",
        "Complete the code to enter text in a prompt and accept it.",
        "alert.send_keys('test input'); alert.accept()",
        "alert.type('test input'); alert.ok()",
        "alert.enter('test input'); alert.confirm()",
        "alert.text = 'test input'; alert.submit()",
        "A", "send_keys types into the prompt and accept clicks OK.",
        "alert = driver.switch_to.alert\n___\n___")

    add(SUBJECT, "Alerts", "Medium", "code_completion",
        "Complete the code to wait for an alert and get its text.",
        "WebDriverWait(driver, 10).until(EC.alert_is_present())",
        "WebDriverWait(driver, 10).until(EC.alert_ready())",
        "WebDriverWait(driver, 10).until(EC.has_alert())",
        "WebDriverWait(driver, 10).until(EC.alert_visible())",
        "A", "alert_is_present returns the Alert object when an alert appears.",
        "alert = ___\nmessage = alert.text")

    add(SUBJECT, "Alerts", "Hard", "code_completion",
        "Complete the code to handle an unexpected alert gracefully.",
        "driver.switch_to.alert; alert.dismiss()",
        "driver.clear_alert()",
        "driver.ignore_alert()",
        "driver.suppress_alert()",
        "A", "Using try/except to dismiss unexpected alerts prevents test failures.",
        "try:\n    alert = ___\n    ___\nexcept NoAlertPresentException:\n    pass")

    add(SUBJECT, "Alerts", "Hard", "code_completion",
        "Complete the code to handle multiple sequential alerts.",
        "driver.switch_to.alert; alert.accept()",
        "driver.accept_all_alerts()",
        "driver.clear_alerts()",
        "driver.dismiss_all()",
        "A", "A while loop with switch_to.alert handles sequential alerts until none remain.",
        "while True:\n    try:\n        alert = ___\n        ___\n    except NoAlertPresentException:\n        break")

    # ===================== WINDOWS =====================
    # MCQ (10)
    add(SUBJECT, "Windows", "Easy", "mcq",
        "How do you get the handle of the current browser window?",
        "driver.current_window_handle", "driver.window_handle", "driver.get_handle()", "driver.active_window",
        "A", "current_window_handle returns a string identifier for the current window.")

    add(SUBJECT, "Windows", "Easy", "mcq",
        "How do you get all open window handles?",
        "driver.window_handles", "driver.all_windows()", "driver.get_handles()", "driver.open_windows",
        "A", "window_handles returns a list of handles for all open browser windows/tabs.")

    add(SUBJECT, "Windows", "Easy", "mcq",
        "Which method switches to a different window?",
        "driver.switch_to.window(handle)", "driver.goto_window(handle)", "driver.focus_window(handle)", "driver.change_window(handle)",
        "A", "switch_to.window(handle) changes the driver focus to the specified window.")

    add(SUBJECT, "Windows", "Medium", "mcq",
        "How do you open a new tab in Selenium 4?",
        "driver.switch_to.new_window('tab')", "driver.open_tab()", "driver.new_tab()", "driver.create_window('tab')",
        "A", "Selenium 4 introduced switch_to.new_window('tab') to open a new tab.")

    add(SUBJECT, "Windows", "Medium", "mcq",
        "How do you open a new browser window in Selenium 4?",
        "driver.switch_to.new_window('window')", "driver.open_window()", "driver.new_window()", "driver.create_window()",
        "A", "switch_to.new_window('window') opens a new browser window in Selenium 4.")

    add(SUBJECT, "Windows", "Medium", "mcq",
        "After clicking a link that opens a new tab, how do you switch to the new tab?",
        "Get the new handle from window_handles and switch_to.window(new_handle)",
        "The driver automatically switches", "Use switch_to.new_tab()", "Use driver.tabs[-1]",
        "A", "You must manually switch to the new tab by finding its handle in window_handles.")

    add(SUBJECT, "Windows", "Hard", "mcq",
        "How do you get the current window size?",
        "driver.get_window_size()", "driver.window_size", "driver.get_size()", "driver.size()",
        "A", "get_window_size() returns a dictionary with 'width' and 'height' keys.")

    add(SUBJECT, "Windows", "Hard", "mcq",
        "Which method sets both position and size of the browser window?",
        "driver.set_window_rect(x, y, width, height)", "driver.set_window_bounds(x, y, w, h)", "driver.window_rect(x, y, w, h)", "driver.configure_window(x, y, w, h)",
        "A", "set_window_rect sets the position (x,y) and size (width,height) in one call.")

    add(SUBJECT, "Windows", "Hard", "mcq",
        "What is the difference between new_window('tab') and new_window('window')?",
        "tab opens in same browser window; window opens a separate browser window",
        "They are identical", "tab is faster than window", "window is deprecated",
        "A", "new_window('tab') opens a new tab in the same window, while 'window' opens a separate browser window.")

    add(SUBJECT, "Windows", "Medium", "mcq",
        "How do you set the browser window to a specific size?",
        "driver.set_window_size(width, height)", "driver.resize(width, height)", "driver.window_size = (width, height)", "driver.set_size(width, height)",
        "A", "set_window_size(width, height) resizes the browser window.")

    # Output (5)
    add(SUBJECT, "Windows", "Easy", "output",
        "What type of value does driver.current_window_handle return?",
        "A string (window handle identifier)", "An integer", "A Window object", "A boolean",
        "A", "current_window_handle returns a unique string identifier for the current window.",
        "handle = driver.current_window_handle\nprint(type(handle).__name__)")

    add(SUBJECT, "Windows", "Medium", "output",
        "What does this code print for a browser with 2 open tabs?",
        "2", "A list of handle strings", "True", "The active tab handle",
        "A", "window_handles returns a list of all handles, and len() gives the count.",
        "print(len(driver.window_handles))")

    add(SUBJECT, "Windows", "Medium", "output",
        "What does this code accomplish?",
        "Switches to the newly opened tab/window", "Closes the new tab", "Opens a blank tab", "Refreshes the current tab",
        "A", "The code captures the new handle by comparing before/after handle sets, then switches to it.",
        "original = driver.current_window_handle\nfor handle in driver.window_handles:\n    if handle != original:\n        driver.switch_to.window(handle)\n        break\nprint('Switched to new window')")

    add(SUBJECT, "Windows", "Hard", "output",
        "What does this Selenium 4 code do?",
        "Opens a new tab and switches to it automatically", "Opens a new window", "Duplicates the current tab", "Closes the current tab",
        "A", "switch_to.new_window('tab') opens a new tab and automatically switches the driver to it.",
        "driver.switch_to.new_window('tab')\nprint('New tab opened')\nprint(len(driver.window_handles))")

    add(SUBJECT, "Windows", "Hard", "output",
        "What does get_window_size() return?",
        "A dictionary with width and height keys", "A tuple (width, height)", "An integer", "A Size object",
        "A", "get_window_size() returns a dict like {'width': 1920, 'height': 1080}.",
        "size = driver.get_window_size()\nprint(type(size).__name__)")

    # Scenario (5)
    add(SUBJECT, "Windows", "Easy", "scenario",
        "After clicking a link that opens in a new tab, your test continues interacting with the original tab. How do you fix this?",
        "Switch to the new tab using switch_to.window() with the new tab's handle",
        "Close the original tab", "Use time.sleep and try again", "Refresh the page",
        "A", "You must explicitly switch to the new tab's handle to interact with it.")

    add(SUBJECT, "Windows", "Medium", "scenario",
        "You need to verify content in a popup window, then close it and return to the main window. What is the correct workflow?",
        "Store main handle, switch to popup, verify, close popup, switch back to main handle",
        "Close the popup from the main window", "Use JavaScript to read the popup content", "Switch to popup and it auto-returns on close",
        "A", "Store the main handle, switch to the popup, do your verification, close it, then switch back.")

    add(SUBJECT, "Windows", "Medium", "scenario",
        "Your test opens multiple tabs. You need to close all except the original. What is the safest approach?",
        "Store the original handle, iterate through all handles closing non-original ones, then switch to original",
        "Use driver.quit() and reopen", "Close tabs with keyboard shortcut", "Use driver.close_all_except_current()",
        "A", "Iterating through handles and closing non-original tabs preserves the main tab.")

    add(SUBJECT, "Windows", "Hard", "scenario",
        "A test needs to compare content between two windows side by side. How do you handle this?",
        "Switch between windows using switch_to.window, collecting data from each",
        "Open both windows simultaneously with threading", "Use JavaScript to access both windows", "Take screenshots of both and compare",
        "A", "Switching between window handles lets you collect and compare data from both windows.")

    add(SUBJECT, "Windows", "Hard", "scenario",
        "A third-party payment gateway opens in a new window. After payment, the window closes automatically. How do you return to the original window?",
        "Wait for the payment window to close (window_handles count decreases), then switch to the original handle",
        "The driver returns automatically", "Use switch_to.default_content()", "Call driver.back()",
        "A", "Waiting for the window count to decrease and then switching to the stored original handle is the correct approach.")

    # Code Completion (5)
    add(SUBJECT, "Windows", "Easy", "code_completion",
        "Complete the code to switch to a new window.",
        "driver.switch_to.window(new_handle)", "driver.goto(new_handle)", "driver.focus(new_handle)", "driver.change_to(new_handle)",
        "A", "switch_to.window with the handle string switches the driver focus.",
        "original = driver.current_window_handle\nnew_handle = [h for h in driver.window_handles if h != original][0]\n___")

    add(SUBJECT, "Windows", "Medium", "code_completion",
        "Complete the code to open a new tab in Selenium 4.",
        "driver.switch_to.new_window('tab')", "driver.new_tab()", "driver.open_tab()", "driver.create_tab()",
        "A", "switch_to.new_window('tab') is the Selenium 4 way to open a new tab.",
        "original = driver.current_window_handle\n___\ndriver.get('https://example.com')")

    add(SUBJECT, "Windows", "Medium", "code_completion",
        "Complete the code to close the current tab and switch back to the original.",
        "driver.close(); driver.switch_to.window(original)",
        "driver.quit(); driver.switch_to.window(original)",
        "driver.close_tab(); driver.focus(original)",
        "driver.exit(); driver.goto(original)",
        "A", "close() closes the current window/tab, then switch_to.window returns to the original.",
        "original = driver.current_window_handle\n# ... switched to new tab, done with it ...\n___\n___")

    add(SUBJECT, "Windows", "Hard", "code_completion",
        "Complete the code to set the window position and size.",
        "driver.set_window_position(0, 0); driver.set_window_size(1920, 1080)",
        "driver.set_rect(0, 0, 1920, 1080)",
        "driver.window = (0, 0, 1920, 1080)",
        "driver.position(0,0).size(1920,1080)",
        "A", "set_window_position and set_window_size control window placement and dimensions.",
        "___\n___")

    add(SUBJECT, "Windows", "Hard", "code_completion",
        "Complete the code to wait until a new window opens.",
        "WebDriverWait(driver, 10).until(lambda d: len(d.window_handles) > 1)",
        "WebDriverWait(driver, 10).until(EC.new_window())",
        "driver.wait_for_window(10)",
        "time.sleep(10)",
        "A", "A lambda checking window_handles length waits until a new window/tab opens.",
        "from selenium.webdriver.support.ui import WebDriverWait\noriginal_handles = driver.window_handles\n___")

    # ===================== SCREENSHOTS =====================
    # MCQ (10)
    add(SUBJECT, "Screenshots", "Easy", "mcq",
        "Which method takes a screenshot of the current page?",
        "driver.save_screenshot('file.png')", "driver.screenshot('file.png')", "driver.capture('file.png')", "driver.take_screenshot('file.png')",
        "A", "save_screenshot saves a PNG screenshot of the current page to the specified file.")

    add(SUBJECT, "Screenshots", "Easy", "mcq",
        "Which method returns a screenshot as a base64-encoded string?",
        "driver.get_screenshot_as_base64()", "driver.screenshot_base64()", "driver.capture_base64()", "driver.screenshot_string()",
        "A", "get_screenshot_as_base64() returns the screenshot as a base64 string for embedding in reports.")

    add(SUBJECT, "Screenshots", "Easy", "mcq",
        "Which method returns a screenshot as raw PNG bytes?",
        "driver.get_screenshot_as_png()", "driver.screenshot_bytes()", "driver.capture_png()", "driver.raw_screenshot()",
        "A", "get_screenshot_as_png() returns the screenshot as bytes in PNG format.")

    add(SUBJECT, "Screenshots", "Medium", "mcq",
        "How do you take a screenshot of a specific element?",
        "element.screenshot('file.png')", "driver.screenshot_element(element, 'file.png')", "driver.capture_element(element)", "element.save_image('file.png')",
        "A", "WebElement.screenshot() takes a screenshot of just that element.")

    add(SUBJECT, "Screenshots", "Medium", "mcq",
        "In which image format does Selenium save screenshots by default?",
        "PNG", "JPEG", "BMP", "WebP",
        "A", "Selenium saves screenshots in PNG format by default.")

    add(SUBJECT, "Screenshots", "Medium", "mcq",
        "What does save_screenshot return?",
        "True if successful, False otherwise", "The file path", "The image bytes", "None",
        "A", "save_screenshot returns a boolean indicating success or failure.")

    add(SUBJECT, "Screenshots", "Hard", "mcq",
        "How can you take a full-page screenshot in Selenium 4 with Firefox?",
        "Use driver.save_full_page_screenshot('file.png')", "Scroll and stitch multiple screenshots", "Use JavaScript to capture the page", "Use a third-party library only",
        "A", "Selenium 4 Firefox supports save_full_page_screenshot for capturing the entire scrollable page.")

    add(SUBJECT, "Screenshots", "Hard", "mcq",
        "Which Selenium 4 feature uses CDP to take full-page screenshots in Chrome?",
        "Execute CDP command Page.captureScreenshot with captureBeyondViewport", "driver.full_screenshot()", "driver.chrome_screenshot()", "driver.cdp_screenshot()",
        "A", "Chrome DevTools Protocol command Page.captureScreenshot can capture beyond the viewport.")

    add(SUBJECT, "Screenshots", "Hard", "mcq",
        "When automating screenshot comparison testing, which approach is recommended?",
        "Take baseline screenshots and compare pixel differences with a tolerance threshold",
        "Compare file sizes only", "Use MD5 hashes of screenshots", "Manual visual comparison",
        "A", "Pixel-by-pixel comparison with a tolerance threshold accounts for minor rendering differences.")

    add(SUBJECT, "Screenshots", "Medium", "mcq",
        "What is the typical use case for element-level screenshots?",
        "Capturing specific UI components for visual regression testing", "Capturing the entire page", "Taking video recordings", "Measuring element size",
        "A", "Element screenshots capture individual UI components for focused visual testing.")

    # Output (5)
    add(SUBJECT, "Screenshots", "Easy", "output",
        "What does this code produce?",
        "A PNG file named 'page.png' containing the screenshot", "A JPEG file", "A text file", "An HTML file",
        "A", "save_screenshot creates a PNG image file of the current browser view.",
        "result = driver.save_screenshot('page.png')\nprint(result)")

    add(SUBJECT, "Screenshots", "Medium", "output",
        "What type does get_screenshot_as_base64() return?",
        "A string (base64 encoded)", "Bytes", "A file path", "An image object",
        "A", "get_screenshot_as_base64 returns a base64-encoded string of the PNG screenshot.",
        "screenshot = driver.get_screenshot_as_base64()\nprint(type(screenshot).__name__)")

    add(SUBJECT, "Screenshots", "Medium", "output",
        "What does this code do?",
        "Takes a screenshot of only the logo element and saves it as logo.png",
        "Takes a full-page screenshot", "Saves the logo image source", "Downloads the logo image",
        "A", "element.screenshot captures just the specified element's visual representation.",
        "logo = driver.find_element(By.ID, 'logo')\nlogo.screenshot('logo.png')\nprint('Element screenshot saved')")

    add(SUBJECT, "Screenshots", "Hard", "output",
        "What type does get_screenshot_as_png() return?",
        "bytes", "str", "Image object", "file handle",
        "A", "get_screenshot_as_png returns raw bytes in PNG format.",
        "data = driver.get_screenshot_as_png()\nprint(type(data).__name__)")

    add(SUBJECT, "Screenshots", "Hard", "output",
        "What does this code accomplish?",
        "Saves a full-page screenshot including content below the fold (Firefox only)",
        "Saves a regular viewport screenshot", "Saves multiple screenshots", "Raises an error",
        "A", "save_full_page_screenshot captures the entire scrollable page in Firefox.",
        "# Firefox only\ndriver.save_full_page_screenshot('fullpage.png')\nprint('Full page screenshot saved')")

    # Scenario (5)
    add(SUBJECT, "Screenshots", "Easy", "scenario",
        "Your test fails intermittently and you want to capture the page state on failure. Where should you add screenshot logic?",
        "In a teardown method or exception handler that runs on test failure",
        "Before every test step", "Only at the start of the test", "After the test suite completes",
        "A", "Capturing screenshots on failure (in teardown or except block) provides debugging evidence.")

    add(SUBJECT, "Screenshots", "Medium", "scenario",
        "You need to include screenshots in an HTML test report. Which screenshot method is most suitable?",
        "get_screenshot_as_base64() to embed directly in HTML", "save_screenshot() and link the file", "get_screenshot_as_png() and convert", "Print screen using OS tools",
        "A", "Base64 screenshots can be embedded directly in HTML img tags without separate files.")

    add(SUBJECT, "Screenshots", "Medium", "scenario",
        "You need to compare the current page against a baseline screenshot to detect visual regressions. What is the recommended approach?",
        "Use a visual testing library (like PIL/Pillow) to compare pixel differences with a threshold",
        "Compare file sizes", "Compare base64 strings directly", "Manual comparison",
        "A", "Libraries like Pillow can compute pixel differences and apply thresholds for reliable visual regression testing.")

    add(SUBJECT, "Screenshots", "Hard", "scenario",
        "Your application has a very long scrollable page. You need a complete screenshot in Chrome. How do you handle this?",
        "Use CDP commands via driver.execute_cdp_cmd to capture the full page",
        "Take multiple viewport screenshots and stitch manually",
        "Use save_full_page_screenshot (Chrome does not support this natively)",
        "Resize the window to fit all content",
        "A", "Chrome DevTools Protocol commands can capture beyond the viewport for full-page screenshots.")

    add(SUBJECT, "Screenshots", "Hard", "scenario",
        "You need to take screenshots at specific breakpoints (mobile, tablet, desktop) for responsive testing. How do you automate this?",
        "Set different window sizes with set_window_size() and take a screenshot at each size",
        "Use different browsers for each size", "Take one screenshot and crop it", "Use CSS media queries to switch views",
        "A", "Resizing the window to different breakpoints and capturing screenshots tests responsive design.")

    # Code Completion (5)
    add(SUBJECT, "Screenshots", "Easy", "code_completion",
        "Complete the code to save a screenshot.",
        "driver.save_screenshot('screenshot.png')", "driver.screenshot('screenshot.png')", "driver.capture('screenshot.png')", "driver.snap('screenshot.png')",
        "A", "save_screenshot saves the current page as a PNG file.",
        "driver.get('https://example.com')\n___")

    add(SUBJECT, "Screenshots", "Medium", "code_completion",
        "Complete the code to take an element screenshot.",
        "element.screenshot('button.png')", "driver.element_screenshot(element, 'button.png')", "element.save_image('button.png')", "element.capture('button.png')",
        "A", "WebElement.screenshot() captures just the element.",
        "element = driver.find_element(By.ID, 'submit-btn')\n___")

    add(SUBJECT, "Screenshots", "Medium", "code_completion",
        "Complete the code to embed a screenshot in an HTML report.",
        "driver.get_screenshot_as_base64()", "driver.get_screenshot_as_png()", "driver.save_screenshot('temp.png')", "driver.screenshot_to_html()",
        "A", "Base64 encoding allows direct embedding in HTML without separate image files.",
        "import base64\nscreenshot_b64 = ___\nhtml = f'<img src=\"data:image/png;base64,{screenshot_b64}\" />'")

    add(SUBJECT, "Screenshots", "Hard", "code_completion",
        "Complete the code to capture a full-page screenshot using CDP in Chrome.",
        "driver.execute_cdp_cmd('Page.captureScreenshot', {'captureBeyondViewport': True})",
        "driver.full_page_screenshot()",
        "driver.chrome_full_screenshot()",
        "driver.execute_script('window.screenshot()')",
        "A", "CDP command Page.captureScreenshot with captureBeyondViewport captures the entire page.",
        "result = ___\nimport base64\nwith open('full.png', 'wb') as f:\n    f.write(base64.b64decode(result['data']))")

    add(SUBJECT, "Screenshots", "Hard", "code_completion",
        "Complete the code to take screenshots at different viewport sizes.",
        "driver.set_window_size(w, h); driver.save_screenshot(f'screenshot_{w}x{h}.png')",
        "driver.resize(w, h); driver.capture(f'{w}x{h}.png')",
        "driver.viewport(w, h); driver.snap(f'{w}x{h}.png')",
        "driver.set_size(w, h); driver.screenshot(f'{w}x{h}.png')",
        "A", "Setting window size and saving a screenshot for each breakpoint tests responsive layouts.",
        "viewports = [(375, 667), (768, 1024), (1920, 1080)]\nfor w, h in viewports:\n    ___")

    # ===================== JAVASCRIPT EXECUTOR =====================
    # MCQ (11)
    add(SUBJECT, "JavaScript Executor", "Easy", "mcq",
        "Which method executes JavaScript in the browser?",
        "driver.execute_script()", "driver.run_js()", "driver.javascript()", "driver.eval()",
        "A", "execute_script() runs JavaScript code in the context of the current page.")

    add(SUBJECT, "JavaScript Executor", "Easy", "mcq",
        "How do you scroll to the bottom of a page using JavaScript?",
        "driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')", "driver.scroll_down()", "driver.execute_script('scroll.bottom()')", "driver.page_down()",
        "A", "window.scrollTo with scrollHeight scrolls to the page bottom.")

    add(SUBJECT, "JavaScript Executor", "Easy", "mcq",
        "How do you pass a WebElement to a JavaScript function?",
        "As an argument: execute_script('arguments[0].click()', element)", "As a variable: execute_script('element.click()')", "Convert to string first", "Use element.js_click()",
        "A", "WebElements are passed as arguments and accessed via the arguments array in the script.")

    add(SUBJECT, "JavaScript Executor", "Medium", "mcq",
        "What does execute_async_script() do differently from execute_script()?",
        "It waits for a callback to be invoked before returning", "It runs in a separate thread", "It does not block the test", "It executes faster",
        "A", "execute_async_script provides a callback (last argument) that must be called to signal completion.")

    add(SUBJECT, "JavaScript Executor", "Medium", "mcq",
        "How do you return a value from execute_script?",
        "Use 'return' in the JavaScript: execute_script('return document.title')", "Assign to a variable in JS", "Use output parameter", "Use execute_script_with_return()",
        "A", "The 'return' statement in the script sends the value back to the Python caller.")

    add(SUBJECT, "JavaScript Executor", "Medium", "mcq",
        "Which JavaScript can remove the readonly attribute from an input field?",
        "arguments[0].removeAttribute('readonly')", "arguments[0].readonly = false", "arguments[0].editable = true", "arguments[0].unlock()",
        "A", "removeAttribute('readonly') removes the HTML readonly attribute from the element.")

    add(SUBJECT, "JavaScript Executor", "Medium", "mcq",
        "How do you scroll an element into view using JavaScript?",
        "execute_script('arguments[0].scrollIntoView(true)', element)", "execute_script('scrollTo(element)')", "element.scroll_into_view()", "driver.scroll_to(element)",
        "A", "scrollIntoView(true) scrolls the page until the element is visible in the viewport.")

    add(SUBJECT, "JavaScript Executor", "Hard", "mcq",
        "How do you change the value of a hidden input field using JavaScript?",
        "execute_script(\"arguments[0].value = 'new_value'\", hidden_input)", "hidden_input.send_keys('new_value')", "driver.set_value(hidden_input, 'new_value')", "hidden_input.clear(); hidden_input.type('new_value')",
        "A", "JavaScript can directly set the value property of hidden elements that Selenium cannot interact with normally.")

    add(SUBJECT, "JavaScript Executor", "Hard", "mcq",
        "What does execute_script return when the script returns a DOM element?",
        "A WebElement object", "An HTML string", "A dictionary", "None",
        "A", "When JavaScript returns a DOM element, Selenium converts it to a WebElement object.")

    add(SUBJECT, "JavaScript Executor", "Hard", "mcq",
        "How do you get the shadow DOM root of a web component?",
        "execute_script('return arguments[0].shadowRoot', host_element)", "host_element.shadow_root", "driver.find_shadow_root(host_element)", "host_element.get_shadow_dom()",
        "A", "Accessing shadowRoot property via JavaScript returns the shadow DOM root element.")

    add(SUBJECT, "JavaScript Executor", "Easy", "mcq",
        "What does execute_script('return document.readyState') return when the page is fully loaded?",
        "complete", "loaded", "ready", "done",
        "A", "document.readyState returns 'complete' when the page and all resources have finished loading.")

    # Output (6)
    add(SUBJECT, "JavaScript Executor", "Easy", "output",
        "What does this code return?",
        "The page title as a string", "None", "The document object", "An error",
        "A", "return document.title in JavaScript sends the page title back to Python.",
        "result = driver.execute_script('return document.title')\nprint(result)")

    add(SUBJECT, "JavaScript Executor", "Medium", "output",
        "What does this code do?",
        "Clicks the element using JavaScript instead of the Selenium click method",
        "Finds the element", "Highlights the element", "Removes the element",
        "A", "JavaScript click bypasses Selenium's click mechanism, useful when element is obscured.",
        "button = driver.find_element(By.ID, 'submit')\ndriver.execute_script('arguments[0].click()', button)\nprint('JS click performed')")

    add(SUBJECT, "JavaScript Executor", "Medium", "output",
        "What does this code print?",
        "The inner HTML content of the element", "The outer HTML", "The text content", "The tag name",
        "A", "innerHTML property returns the HTML content inside the element.",
        "elem = driver.find_element(By.ID, 'content')\nhtml = driver.execute_script('return arguments[0].innerHTML', elem)\nprint(type(html).__name__)")

    add(SUBJECT, "JavaScript Executor", "Hard", "output",
        "What does this code return?",
        "A list of all href values from anchor elements on the page",
        "A single href", "A list of WebElements", "An error",
        "A", "The script collects all anchor hrefs into an array and returns it as a Python list.",
        "links = driver.execute_script(\n    'return Array.from(document.querySelectorAll(\"a\")).map(a => a.href)'\n)\nprint(type(links).__name__)")

    add(SUBJECT, "JavaScript Executor", "Hard", "output",
        "What does this code accomplish?",
        "Highlights the element with a red border for visual debugging",
        "Removes the element", "Hides the element", "Changes the element text",
        "A", "Setting the border style via JavaScript visually highlights the element on the page.",
        "elem = driver.find_element(By.ID, 'target')\ndriver.execute_script(\"arguments[0].style.border = '3px solid red'\", elem)\nprint('Element highlighted')")

    add(SUBJECT, "JavaScript Executor", "Easy", "output",
        "What value does this code print?",
        "The total scrollable height of the page in pixels", "The viewport height", "0", "None",
        "A", "document.body.scrollHeight returns the total height of the page content.",
        "height = driver.execute_script('return document.body.scrollHeight')\nprint(type(height).__name__)")

    # Scenario (5)
    add(SUBJECT, "JavaScript Executor", "Easy", "scenario",
        "An element is obscured by a floating header and Selenium's click() fails. How can you click it?",
        "Use execute_script('arguments[0].click()', element) for a JavaScript click",
        "Scroll up manually", "Close the header first", "Use ActionChains move_to_element",
        "A", "JavaScript click works at the DOM level and is not affected by overlapping elements.")

    add(SUBJECT, "JavaScript Executor", "Medium", "scenario",
        "You need to test an infinite scroll page. How do you trigger loading more content?",
        "Execute JavaScript to scroll to the bottom: execute_script('window.scrollTo(0, document.body.scrollHeight)')",
        "Use ActionChains to scroll", "Send Page Down key", "Use driver.scroll_down()",
        "A", "JavaScript scroll to bottom triggers the infinite scroll mechanism to load more content.")

    add(SUBJECT, "JavaScript Executor", "Medium", "scenario",
        "A date picker only accepts input via its JavaScript API, not keyboard input. How do you set a date?",
        "Use execute_script to set the value and trigger change events",
        "Type the date with send_keys", "Use ActionChains to click dates", "Modify the date in the database",
        "A", "JavaScript can set the input value and dispatch change/input events to update the date picker.")

    add(SUBJECT, "JavaScript Executor", "Hard", "scenario",
        "You need to interact with elements inside a Shadow DOM. Standard Selenium locators cannot access them. What approach works?",
        "Use execute_script to traverse shadowRoot and find the element",
        "Use By.SHADOW_CSS", "Use XPath to enter shadow DOM", "Shadow DOM elements are inaccessible",
        "A", "JavaScript can access shadowRoot and its child elements, which are otherwise hidden from standard locators.")

    add(SUBJECT, "JavaScript Executor", "Hard", "scenario",
        "You need to intercept and modify network requests in your test. Which JavaScript approach works with Selenium?",
        "Use execute_cdp_cmd for Chrome DevTools Protocol network interception",
        "Use execute_script to override XMLHttpRequest", "Network requests cannot be intercepted", "Use a proxy server only",
        "A", "CDP commands provide direct network interception capabilities in Chrome through Selenium 4.")

    # Code Completion (5)
    add(SUBJECT, "JavaScript Executor", "Easy", "code_completion",
        "Complete the code to scroll to the bottom of the page.",
        "driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')",
        "driver.scroll_to_bottom()",
        "driver.execute_script('scroll.down()')",
        "driver.page_down()",
        "A", "window.scrollTo with scrollHeight scrolls to the page bottom.",
        "___\nprint('Scrolled to bottom')")

    add(SUBJECT, "JavaScript Executor", "Medium", "code_completion",
        "Complete the code to get the value of a CSS property using JavaScript.",
        "driver.execute_script('return window.getComputedStyle(arguments[0]).getPropertyValue(arguments[1])', elem, 'color')",
        "driver.execute_script('return arguments[0].style.color', elem)",
        "elem.css_value('color')",
        "driver.get_css(elem, 'color')",
        "A", "getComputedStyle returns the computed CSS values, including inherited and applied styles.",
        "elem = driver.find_element(By.ID, 'heading')\ncolor = ___")

    add(SUBJECT, "JavaScript Executor", "Medium", "code_completion",
        "Complete the code to scroll an element into view.",
        "driver.execute_script('arguments[0].scrollIntoView(true)', element)",
        "driver.scroll_to(element)",
        "element.scroll_into_view()",
        "driver.execute_script('scrollTo(element)')",
        "A", "scrollIntoView(true) aligns the element to the top of the viewport.",
        "element = driver.find_element(By.ID, 'footer')\n___")

    add(SUBJECT, "JavaScript Executor", "Hard", "code_completion",
        "Complete the code to set a value on a hidden input and trigger a change event.",
        "driver.execute_script(\"arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('change'))\", elem, 'new_value')",
        "elem.send_keys('new_value')",
        "driver.execute_script('arguments[0].type(arguments[1])', elem, 'new_value')",
        "elem.set_attribute('value', 'new_value')",
        "A", "Setting value and dispatching a change event mimics user input for hidden fields.",
        "elem = driver.find_element(By.ID, 'hidden-field')\n___")

    add(SUBJECT, "JavaScript Executor", "Hard", "code_completion",
        "Complete the code to access a shadow DOM element.",
        "driver.execute_script('return arguments[0].shadowRoot.querySelector(arguments[1])', host, '#inner-element')",
        "host.find_element(By.CSS_SELECTOR, '#inner-element')",
        "driver.find_shadow_element(host, '#inner-element')",
        "host.shadow_root.find('#inner-element')",
        "A", "shadowRoot.querySelector traverses into the shadow DOM to find child elements.",
        "host = driver.find_element(By.CSS_SELECTOR, 'my-component')\ninner = ___")

    # ===================== SELENIUM GRID =====================
    # MCQ (11)
    add(SUBJECT, "Selenium Grid", "Easy", "mcq",
        "What is Selenium Grid?",
        "A tool for running tests on remote machines across multiple browsers and OS",
        "A CSS grid testing tool", "A test reporting framework", "A CI/CD platform",
        "A", "Selenium Grid enables distributed test execution across different machines, browsers, and operating systems.")

    add(SUBJECT, "Selenium Grid", "Easy", "mcq",
        "Which component in Selenium Grid manages test sessions?",
        "Hub (or Router in Grid 4)", "Node", "Driver", "Executor",
        "A", "The Hub (Grid 3) or Router (Grid 4) routes test requests to available nodes.")

    add(SUBJECT, "Selenium Grid", "Easy", "mcq",
        "How do you connect to a remote Selenium Grid from Python?",
        "webdriver.Remote(command_executor=url, options=options)", "webdriver.Grid(url)", "webdriver.connect(url)", "selenium.remote(url)",
        "A", "webdriver.Remote creates a remote WebDriver session connected to the Grid hub.")

    add(SUBJECT, "Selenium Grid", "Medium", "mcq",
        "What is the default port for Selenium Grid Hub?",
        "4444", "8080", "3000", "5555",
        "A", "Selenium Grid Hub runs on port 4444 by default.")

    add(SUBJECT, "Selenium Grid", "Medium", "mcq",
        "How do you start a Selenium Grid standalone server?",
        "java -jar selenium-server-<version>.jar standalone", "selenium-grid start", "start-grid --standalone", "selenium standalone",
        "A", "The standalone mode starts Hub and Node in a single process.")

    add(SUBJECT, "Selenium Grid", "Medium", "mcq",
        "What are Nodes in Selenium Grid?",
        "Machines that run browser instances and execute tests", "The central coordinator", "Test scripts", "Reporting servers",
        "A", "Nodes register with the Hub and execute tests using local browser installations.")

    add(SUBJECT, "Selenium Grid", "Medium", "mcq",
        "Which capability specifies the browser name when connecting to Grid?",
        "browserName in Options", "browser in capabilities", "driver in options", "type in config",
        "A", "The browserName capability (set via Options) tells Grid which browser to use.")

    add(SUBJECT, "Selenium Grid", "Hard", "mcq",
        "What is new about the architecture in Selenium Grid 4?",
        "It uses a distributed architecture with Router, Distributor, Session Map, and Nodes",
        "It only supports Chrome", "It requires Docker", "It removes the Hub concept entirely",
        "A", "Grid 4 has a more modular architecture with separate components for routing, distribution, and session management.")

    add(SUBJECT, "Selenium Grid", "Hard", "mcq",
        "How does Selenium Grid 4 support Docker?",
        "It can dynamically spin up Docker containers with browsers using the --docker flag",
        "Docker is required for all Grid 4 setups", "Grid 4 runs only inside Docker", "Docker support is not available",
        "A", "Grid 4 has built-in Docker support to dynamically create browser containers on demand.")

    add(SUBJECT, "Selenium Grid", "Hard", "mcq",
        "Which Selenium Grid 4 mode combines hub and node in one process?",
        "Standalone mode", "Combined mode", "Single mode", "Unified mode",
        "A", "Standalone mode runs all Grid components (Router, Distributor, Node) in a single process.")

    add(SUBJECT, "Selenium Grid", "Hard", "mcq",
        "How do you view the Grid 4 status and session information?",
        "Access the Grid UI at http://hub:4444/ui or use the /status API endpoint",
        "Check the log files only", "Run grid-status command", "Use the Selenium IDE",
        "A", "Grid 4 provides a web UI at /ui and a REST API at /status for monitoring.")

    # Output (5)
    add(SUBJECT, "Selenium Grid", "Easy", "output",
        "What does this code create?",
        "A remote WebDriver session connected to a Selenium Grid hub",
        "A local Chrome instance", "A Grid node", "A test report",
        "A", "webdriver.Remote establishes a remote session with the Grid hub.",
        "from selenium import webdriver\noptions = webdriver.ChromeOptions()\ndriver = webdriver.Remote(\n    command_executor='http://localhost:4444/wd/hub',\n    options=options\n)\nprint(type(driver).__name__)")

    add(SUBJECT, "Selenium Grid", "Medium", "output",
        "What does this code print?",
        "The session ID of the remote WebDriver session", "The Grid URL", "The browser name", "None",
        "A", "session_id is a unique identifier for the remote session on the Grid.",
        "driver = webdriver.Remote(\n    command_executor='http://localhost:4444/wd/hub',\n    options=webdriver.ChromeOptions()\n)\nprint(driver.session_id)\ndriver.quit()")

    add(SUBJECT, "Selenium Grid", "Medium", "output",
        "What does this code configure?",
        "Firefox browser options for a remote Grid session",
        "A local Firefox instance", "A Chrome session", "Grid server settings",
        "A", "FirefoxOptions configures Firefox capabilities for the remote session.",
        "from selenium import webdriver\noptions = webdriver.FirefoxOptions()\noptions.add_argument('--headless')\ndriver = webdriver.Remote(\n    command_executor='http://grid-hub:4444/wd/hub',\n    options=options\n)\nprint('Remote Firefox session created')")

    add(SUBJECT, "Selenium Grid", "Hard", "output",
        "What does this code accomplish?",
        "Sets a platform capability to request a Linux node from the Grid",
        "Installs Linux on the Grid", "Starts a Linux container", "Changes the browser OS",
        "A", "Platform capabilities help Grid route the session to a matching node.",
        "from selenium import webdriver\noptions = webdriver.ChromeOptions()\noptions.set_capability('platformName', 'linux')\ndriver = webdriver.Remote(\n    command_executor='http://grid:4444/wd/hub',\n    options=options\n)\nprint('Linux Chrome session')")

    add(SUBJECT, "Selenium Grid", "Hard", "output",
        "What does this code check?",
        "The Selenium Grid status by making an HTTP request to the status endpoint",
        "The browser version", "The test results", "The node count",
        "A", "The /status endpoint returns Grid health and availability information.",
        "import urllib.request, json\nresponse = urllib.request.urlopen('http://localhost:4444/status')\ndata = json.loads(response.read())\nprint(data['value']['ready'])")

    # Scenario (5)
    add(SUBJECT, "Selenium Grid", "Easy", "scenario",
        "You need to run tests on both Chrome and Firefox simultaneously. What is the most efficient approach?",
        "Use Selenium Grid with nodes configured for both browsers",
        "Run tests sequentially on each browser", "Use browser emulation", "Use a single browser with different user agents",
        "A", "Selenium Grid enables parallel execution across different browser types on multiple nodes.")

    add(SUBJECT, "Selenium Grid", "Medium", "scenario",
        "Your Grid Node has limited resources and you want to limit it to 3 concurrent Chrome sessions. How do you configure this?",
        "Set max-sessions=3 when starting the node",
        "This cannot be configured", "Limit at the Hub level only", "Use a load balancer",
        "A", "The --max-sessions flag on the node limits concurrent browser sessions.")

    add(SUBJECT, "Selenium Grid", "Medium", "scenario",
        "You want to run Grid in a CI/CD pipeline. Which setup is most convenient?",
        "Use Docker Compose with Selenium Grid images (selenium/hub and selenium/node-chrome)",
        "Install browsers on the CI server manually", "Use a cloud-based Grid service only", "Run Grid on developer machines",
        "A", "Docker Compose with official Selenium images provides a repeatable, containerized Grid setup.")

    add(SUBJECT, "Selenium Grid", "Hard", "scenario",
        "Your Grid setup needs to scale based on test demand. Which Selenium Grid 4 feature helps?",
        "Dynamic Docker container creation with the --docker flag",
        "Manual node management", "Pre-provisioned fixed nodes", "Load balancer auto-scaling",
        "A", "Grid 4 can dynamically spin up Docker containers with browsers to handle variable demand.")

    add(SUBJECT, "Selenium Grid", "Hard", "scenario",
        "You need to debug a failing test running on a remote Grid node. How can you observe the browser?",
        "Use a VNC viewer to connect to the node's VNC server (available in selenium/node-chrome-debug images)",
        "You cannot see remote browsers", "Check the Grid logs only", "Take screenshots only",
        "A", "Debug Docker images include a VNC server for real-time observation of remote browser sessions.")

    # Code Completion (5)
    add(SUBJECT, "Selenium Grid", "Easy", "code_completion",
        "Complete the code to connect to a remote Selenium Grid.",
        "webdriver.Remote(command_executor='http://localhost:4444/wd/hub', options=options)",
        "webdriver.Grid('http://localhost:4444', options=options)",
        "webdriver.connect('http://localhost:4444', options)",
        "webdriver.Remote('localhost:4444')",
        "A", "webdriver.Remote with the hub URL and options creates a remote session.",
        "from selenium import webdriver\noptions = webdriver.ChromeOptions()\ndriver = ___")

    add(SUBJECT, "Selenium Grid", "Medium", "code_completion",
        "Complete the code to request a specific browser version on Grid.",
        "options.set_capability('browserVersion', '120')",
        "options.browser_version = '120'",
        "options.add_argument('--version=120')",
        "options.version('120')",
        "A", "set_capability with browserVersion requests a specific browser version from Grid.",
        "options = webdriver.ChromeOptions()\n___\ndriver = webdriver.Remote(command_executor='http://grid:4444/wd/hub', options=options)")

    add(SUBJECT, "Selenium Grid", "Medium", "code_completion",
        "Complete the Docker Compose command to start a Selenium Grid.",
        "docker-compose up -d", "docker run selenium-grid", "selenium-grid start", "docker start grid",
        "A", "docker-compose up -d starts the Grid services defined in docker-compose.yml in detached mode.",
        "# docker-compose.yml is configured with selenium/hub and selenium/node-chrome\n# Command: ___")

    add(SUBJECT, "Selenium Grid", "Hard", "code_completion",
        "Complete the code to set platform and browser capabilities for Grid.",
        "options.set_capability('platformName', 'linux'); options.set_capability('browserVersion', 'latest')",
        "options.platform = 'linux'; options.version = 'latest'",
        "options.add('platform', 'linux'); options.add('version', 'latest')",
        "options.caps = {'platform': 'linux', 'version': 'latest'}",
        "A", "set_capability adds W3C capabilities for Grid to match the request to an appropriate node.",
        "options = webdriver.ChromeOptions()\n___\ndriver = webdriver.Remote(command_executor='http://grid:4444/wd/hub', options=options)")

    add(SUBJECT, "Selenium Grid", "Hard", "code_completion",
        "Complete the code to check if the Grid is ready before running tests.",
        "json.loads(urllib.request.urlopen('http://localhost:4444/status').read())['value']['ready']",
        "requests.get('http://localhost:4444/health').ok",
        "selenium.grid.status('localhost:4444')",
        "Grid.check_status('localhost:4444')",
        "A", "The /status endpoint returns JSON with a ready field indicating Grid availability.",
        "import urllib.request, json\nis_ready = ___\nprint(f'Grid ready: {is_ready}')")

    # ===================== SELENIUM 4 FEATURES =====================
    # MCQ (11)
    add(SUBJECT, "Selenium 4 Features", "Easy", "mcq",
        "Which protocol does Selenium 4 use for browser communication?",
        "W3C WebDriver Protocol", "JSON Wire Protocol", "HTTP REST", "WebSocket",
        "A", "Selenium 4 fully adopts the W3C WebDriver protocol, replacing the legacy JSON Wire Protocol.")

    add(SUBJECT, "Selenium 4 Features", "Easy", "mcq",
        "What is the relative locator feature in Selenium 4?",
        "Locators that find elements based on their position relative to other elements",
        "Locators using relative XPath", "Locators using CSS position", "Locators based on z-index",
        "A", "Relative locators (friendly locators) use spatial relationships like above, below, near, etc.")

    add(SUBJECT, "Selenium 4 Features", "Easy", "mcq",
        "Which Selenium 4 method opens a new tab?",
        "driver.switch_to.new_window('tab')", "driver.new_tab()", "driver.open_tab()", "driver.create_tab()",
        "A", "switch_to.new_window('tab') is a Selenium 4 feature for opening new tabs.")

    add(SUBJECT, "Selenium 4 Features", "Medium", "mcq",
        "How do you use a relative locator to find an element above another?",
        "locate_with(By.TAG_NAME, 'input').above(reference_element)",
        "By.ABOVE(reference_element)", "find_element(By.RELATIVE, 'above')", "element.find_above()",
        "A", "locate_with combined with above() finds elements positioned above the reference element.")

    add(SUBJECT, "Selenium 4 Features", "Medium", "mcq",
        "What is the Chrome DevTools Protocol (CDP) support in Selenium 4?",
        "Direct access to Chrome DevTools functionality through the driver",
        "A separate testing tool", "A debugging plugin", "A Chrome extension API",
        "A", "Selenium 4 provides execute_cdp_cmd to access Chrome DevTools Protocol features directly.")

    add(SUBJECT, "Selenium 4 Features", "Medium", "mcq",
        "How do you import relative locators in Selenium 4?",
        "from selenium.webdriver.support.relative_locator import locate_with",
        "from selenium import relative_locator",
        "from selenium.locators import relative",
        "from selenium.webdriver import locate_with",
        "A", "locate_with is imported from selenium.webdriver.support.relative_locator.")

    add(SUBJECT, "Selenium 4 Features", "Medium", "mcq",
        "Which Selenium 4 feature allows network interception?",
        "Chrome DevTools Protocol via execute_cdp_cmd", "NetworkInterceptor class", "driver.intercept()", "driver.network_filter()",
        "A", "CDP commands through execute_cdp_cmd enable network request interception and modification.")

    add(SUBJECT, "Selenium 4 Features", "Hard", "mcq",
        "How do you emulate geolocation in Selenium 4 with Chrome?",
        "Use execute_cdp_cmd with Emulation.setGeolocationOverride",
        "Use driver.set_location()", "Use options.add_argument('--geo')", "Use JavaScript navigator.geolocation",
        "A", "CDP command Emulation.setGeolocationOverride sets a custom geolocation for testing.")

    add(SUBJECT, "Selenium 4 Features", "Hard", "mcq",
        "Which relative locator finds elements to the right of a reference element?",
        "locate_with(By.TAG_NAME, 'tag').to_right_of(ref)", "locate_with(By.TAG_NAME, 'tag').right(ref)", "By.RIGHT_OF(ref)", "find_right(ref)",
        "A", "to_right_of() is a relative locator method that finds elements positioned to the right.")

    add(SUBJECT, "Selenium 4 Features", "Hard", "mcq",
        "How do you capture browser console logs in Selenium 4 with Chrome?",
        "Use execute_cdp_cmd with Log.enable and Runtime.consoleAPICalled",
        "Use driver.get_log('browser')", "Use options.enable_logging()", "Console logs are not accessible",
        "A", "CDP commands provide access to browser console logs with more detail than the legacy logging API.")

    add(SUBJECT, "Selenium 4 Features", "Hard", "mcq",
        "What is the 'near' relative locator in Selenium 4?",
        "Finds elements within a certain pixel distance of a reference element",
        "Finds elements with similar text", "Finds adjacent elements in the DOM", "Finds elements with same class",
        "A", "near() finds elements within approximately 50 pixels (default) of the reference element.")

    # Output (5)
    add(SUBJECT, "Selenium 4 Features", "Easy", "output",
        "What does this Selenium 4 code demonstrate?",
        "Using relative locators to find an element above a reference element",
        "Using XPath above axis", "Using CSS position", "Using JavaScript",
        "A", "locate_with with above() is a Selenium 4 relative locator feature.",
        "from selenium.webdriver.support.relative_locator import locate_with\nfrom selenium.webdriver.common.by import By\nemail_label = driver.find_element(locate_with(By.TAG_NAME, 'label').above(password_field))\nprint('Found label above password field')")

    add(SUBJECT, "Selenium 4 Features", "Medium", "output",
        "What does this CDP command do?",
        "Emulates a mobile device by overriding device metrics",
        "Takes a screenshot", "Changes the user agent", "Enables mobile mode",
        "A", "Emulation.setDeviceMetricsOverride changes viewport dimensions and device scale factor.",
        "driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {\n    'width': 375, 'height': 812,\n    'deviceScaleFactor': 3, 'mobile': True\n})\nprint('Mobile emulation enabled')")

    add(SUBJECT, "Selenium 4 Features", "Medium", "output",
        "What does this code demonstrate?",
        "Opening a new window using Selenium 4's new_window feature",
        "Opening a new tab", "Duplicating the current window", "Closing a window",
        "A", "switch_to.new_window('window') opens a new separate browser window.",
        "driver.switch_to.new_window('window')\ndriver.get('https://example.com')\nprint(f'Windows open: {len(driver.window_handles)}')")

    add(SUBJECT, "Selenium 4 Features", "Hard", "output",
        "What does this code accomplish?",
        "Sets a mock geolocation for the browser to simulate being in San Francisco",
        "Gets the current location", "Opens Google Maps", "Calculates distance",
        "A", "CDP Emulation.setGeolocationOverride fakes the browser's geolocation.",
        "driver.execute_cdp_cmd('Emulation.setGeolocationOverride', {\n    'latitude': 37.7749,\n    'longitude': -122.4194,\n    'accuracy': 100\n})\nprint('Geolocation set to San Francisco')")

    add(SUBJECT, "Selenium 4 Features", "Hard", "output",
        "What does this relative locator code find?",
        "An input element that is to the right of the 'Name' label and below the header",
        "Any input element", "The Name label", "The header element",
        "A", "Chaining relative locators narrows the search using multiple spatial constraints.",
        "from selenium.webdriver.support.relative_locator import locate_with\nname_input = driver.find_element(\n    locate_with(By.TAG_NAME, 'input').to_right_of(name_label).below(header)\n)\nprint('Found input with relative locators')")

    # Scenario (5)
    add(SUBJECT, "Selenium 4 Features", "Easy", "scenario",
        "You are upgrading from Selenium 3 to 4. What is the most important change to be aware of?",
        "Selenium 4 uses W3C WebDriver protocol instead of JSON Wire Protocol, which may affect capabilities format",
        "All code must be rewritten", "Python version must be upgraded", "Browser drivers are no longer needed",
        "A", "The W3C protocol change may require updates to how capabilities are set, but most code remains compatible.")

    add(SUBJECT, "Selenium 4 Features", "Medium", "scenario",
        "You need to find an email input field that is below a label with text 'Email'. Which Selenium 4 feature is most suitable?",
        "Relative locators: locate_with(By.TAG_NAME, 'input').below(email_label)",
        "Standard XPath", "CSS selector", "JavaScript",
        "A", "Relative locators provide a natural way to find elements based on visual position relative to other elements.")

    add(SUBJECT, "Selenium 4 Features", "Medium", "scenario",
        "You want to test how your website behaves with slow network conditions. Which Selenium 4 feature can help?",
        "Chrome DevTools Protocol network throttling via execute_cdp_cmd",
        "time.sleep in tests", "Selenium Grid with slow nodes", "Browser proxy settings",
        "A", "CDP Network.emulateNetworkConditions can simulate various network speeds and latencies.")

    add(SUBJECT, "Selenium 4 Features", "Hard", "scenario",
        "You need to mock API responses in your Selenium tests without setting up a separate mock server. How can Selenium 4 help?",
        "Use CDP Fetch.enable to intercept and modify network requests directly",
        "This is not possible with Selenium", "Use execute_script to override fetch", "Use driver.mock_response()",
        "A", "CDP Fetch domain allows intercepting and modifying network requests and responses.")

    add(SUBJECT, "Selenium 4 Features", "Hard", "scenario",
        "You need to test your application's performance metrics (load time, resource timing). Which Selenium 4 approach is best?",
        "Use CDP Performance.getMetrics to collect browser performance data",
        "Use time.time() around navigation calls", "Use a separate performance tool", "Parse access logs",
        "A", "CDP Performance domain provides detailed browser-level performance metrics.")

    # Code Completion (5)
    add(SUBJECT, "Selenium 4 Features", "Easy", "code_completion",
        "Complete the code to find an element below a reference element using relative locators.",
        "locate_with(By.TAG_NAME, 'input').below(label)",
        "By.BELOW(label, 'input')",
        "find_below(label, 'input')",
        "relative(By.TAG_NAME, 'input').below(label)",
        "A", "locate_with with below() finds elements positioned below the reference.",
        "from selenium.webdriver.support.relative_locator import locate_with\nlabel = driver.find_element(By.ID, 'email-label')\ninput_field = driver.find_element(___)")

    add(SUBJECT, "Selenium 4 Features", "Medium", "code_completion",
        "Complete the code to execute a Chrome DevTools Protocol command.",
        "driver.execute_cdp_cmd('Network.enable', {})",
        "driver.cdp('Network.enable')",
        "driver.devtools('Network.enable')",
        "driver.chrome_command('Network.enable')",
        "A", "execute_cdp_cmd sends CDP commands to Chrome for advanced browser control.",
        "___\nprint('Network monitoring enabled')")

    add(SUBJECT, "Selenium 4 Features", "Medium", "code_completion",
        "Complete the code to find an element near a reference element.",
        "locate_with(By.CSS_SELECTOR, '.tooltip').near(button)",
        "By.NEAR(button, '.tooltip')",
        "find_near(button, '.tooltip')",
        "relative('.tooltip').near(button)",
        "A", "near() finds elements within close proximity to the reference element.",
        "from selenium.webdriver.support.relative_locator import locate_with\nbutton = driver.find_element(By.ID, 'help-btn')\ntooltip = driver.find_element(___)")

    add(SUBJECT, "Selenium 4 Features", "Hard", "code_completion",
        "Complete the code to emulate network conditions using CDP.",
        "driver.execute_cdp_cmd('Network.emulateNetworkConditions', {'offline': False, 'latency': 200, 'downloadThroughput': 500000, 'uploadThroughput': 500000})",
        "driver.set_network_speed('slow')",
        "driver.throttle(latency=200)",
        "options.network_conditions = 'slow3G'",
        "A", "CDP Network.emulateNetworkConditions simulates various network conditions.",
        "___\nprint('Network throttling enabled')")

    add(SUBJECT, "Selenium 4 Features", "Hard", "code_completion",
        "Complete the code to capture performance metrics using CDP.",
        "driver.execute_cdp_cmd('Performance.enable', {}); metrics = driver.execute_cdp_cmd('Performance.getMetrics', {})",
        "driver.get_performance_metrics()",
        "driver.performance.collect()",
        "driver.execute_script('return performance.getMetrics()')",
        "A", "CDP Performance domain must be enabled first, then getMetrics retrieves the collected data.",
        "___\nprint(metrics)")

    # ===================== TEST FRAMEWORK INTEGRATION =====================
    # MCQ (11)
    add(SUBJECT, "Test Framework Integration", "Easy", "mcq",
        "Which Python test framework is most commonly used with Selenium?",
        "pytest", "unittest only", "nose", "doctest",
        "A", "pytest is the most popular Python test framework for Selenium automation due to its rich plugin ecosystem.")

    add(SUBJECT, "Test Framework Integration", "Easy", "mcq",
        "What is a pytest fixture commonly used for in Selenium tests?",
        "Setting up and tearing down the WebDriver instance",
        "Running JavaScript", "Generating test data", "Creating page objects",
        "A", "Fixtures manage browser lifecycle, providing driver setup before tests and cleanup after.")

    add(SUBJECT, "Test Framework Integration", "Easy", "mcq",
        "Which pytest scope ensures the browser is shared across all tests in a module?",
        "scope='module'", "scope='all'", "scope='global'", "scope='shared'",
        "A", "scope='module' creates the fixture once per module and shares it across all tests in that module.")

    add(SUBJECT, "Test Framework Integration", "Medium", "mcq",
        "How do you parametrize a Selenium test to run with multiple browsers?",
        "@pytest.mark.parametrize with browser names and create driver accordingly",
        "Use a for loop inside the test", "Create separate test functions", "Use unittest.TestCase",
        "A", "pytest.mark.parametrize runs the same test with different browser configurations.")

    add(SUBJECT, "Test Framework Integration", "Medium", "mcq",
        "What is conftest.py used for in Selenium pytest projects?",
        "Defining shared fixtures and hooks accessible to all tests in the directory",
        "Configuring the browser only", "Storing test data", "Setting environment variables",
        "A", "conftest.py provides shared fixtures, hooks, and plugins to all tests in its directory and subdirectories.")

    add(SUBJECT, "Test Framework Integration", "Medium", "mcq",
        "How do you capture a screenshot on test failure using pytest?",
        "Use a fixture with yield, checking test outcome in the teardown with request.node.rep_call",
        "pytest does this automatically", "Use a try/except in every test", "Use the pytest-screenshot plugin only",
        "A", "A fixture using yield and inspecting the test report in teardown enables failure screenshots.")

    add(SUBJECT, "Test Framework Integration", "Medium", "mcq",
        "Which pytest plugin generates HTML test reports?",
        "pytest-html", "pytest-report", "pytest-results", "pytest-output",
        "A", "pytest-html generates detailed HTML reports with test results and optional screenshots.")

    add(SUBJECT, "Test Framework Integration", "Hard", "mcq",
        "How do you implement parallel Selenium test execution with pytest?",
        "Use pytest-xdist plugin with -n flag", "Use threading in tests", "Use multiprocessing module", "Use pytest --parallel",
        "A", "pytest-xdist enables parallel test execution with -n <num_workers> flag.")

    add(SUBJECT, "Test Framework Integration", "Hard", "mcq",
        "What is the pytest hookimpl for attaching screenshots to HTML reports on failure?",
        "pytest_runtest_makereport hook with extras", "pytest_screenshot hook", "pytest_failure_handler", "pytest_attach_screenshot",
        "A", "pytest_runtest_makereport hook can add extra content (like screenshots) to HTML reports.")

    add(SUBJECT, "Test Framework Integration", "Hard", "mcq",
        "How do you implement retry logic for flaky Selenium tests in pytest?",
        "Use pytest-rerunfailures plugin with --reruns flag",
        "Use while loops in tests", "Use try/except with recursion", "Use pytest --retry",
        "A", "pytest-rerunfailures automatically reruns failed tests a specified number of times.")

    add(SUBJECT, "Test Framework Integration", "Easy", "mcq",
        "Which unittest assertion method checks that a page title equals an expected value?",
        "self.assertEqual(driver.title, 'Expected Title')", "self.assertTitle('Expected Title')", "assert.title(driver, 'Expected Title')", "self.verify_title('Expected Title')",
        "A", "assertEqual is the standard unittest assertion for checking equality.")

    # Output (5)
    add(SUBJECT, "Test Framework Integration", "Easy", "output",
        "What does this pytest fixture do?",
        "Creates a Chrome driver before each test and quits it after the test completes",
        "Creates a permanent browser session", "Installs Chrome", "Configures pytest",
        "A", "The yield fixture sets up the driver, yields it for the test, then tears it down.",
        "@pytest.fixture\ndef driver():\n    d = webdriver.Chrome()\n    yield d\n    d.quit()\nprint('Fixture defined')")

    add(SUBJECT, "Test Framework Integration", "Medium", "output",
        "What does this conftest.py fixture configuration achieve?",
        "Shares one browser session across all tests in the session, quitting at the end",
        "Creates a new browser for each test", "Runs tests in parallel", "Configures the browser",
        "A", "scope='session' creates the fixture once for the entire test session.",
        "@pytest.fixture(scope='session')\ndef browser():\n    driver = webdriver.Chrome()\n    yield driver\n    driver.quit()\nprint('Session-scoped fixture')")

    add(SUBJECT, "Test Framework Integration", "Medium", "output",
        "How many times will the test function run with this parametrize decorator?",
        "3 times, once for each browser", "1 time", "2 times", "It depends on the system",
        "A", "parametrize with 3 values runs the test function 3 times with different browser names.",
        "@pytest.mark.parametrize('browser_name', ['chrome', 'firefox', 'edge'])\ndef test_login(browser_name):\n    print(f'Testing on {browser_name}')\nprint('Parametrized test')")

    add(SUBJECT, "Test Framework Integration", "Hard", "output",
        "What does this pytest hook do?",
        "Captures and attaches a screenshot to the HTML report when a test fails",
        "Takes screenshots before every test", "Generates a PDF report", "Logs test results to a file",
        "A", "The hook checks for test failure and adds a base64 screenshot as an extra to the HTML report.",
        "@pytest.hookimpl(hookwrapper=True)\ndef pytest_runtest_makereport(item):\n    outcome = yield\n    report = outcome.get_result()\n    if report.when == 'call' and report.failed:\n        driver = item.funcargs.get('driver')\n        if driver:\n            screenshot = driver.get_screenshot_as_base64()\nprint('Failure screenshot hook')")

    add(SUBJECT, "Test Framework Integration", "Hard", "output",
        "What does this fixture do with the request parameter?",
        "Accesses the test name and uses it to create a unique screenshot filename on failure",
        "Gets the HTTP request", "Fetches test data", "Creates a network request",
        "A", "request.node.name provides the test function name, useful for naming artifacts.",
        "@pytest.fixture(autouse=True)\ndef screenshot_on_failure(request, driver):\n    yield\n    if request.node.rep_call.failed:\n        driver.save_screenshot(f'{request.node.name}_failure.png')\nprint('Auto-screenshot fixture')")

    # Scenario (5)
    add(SUBJECT, "Test Framework Integration", "Easy", "scenario",
        "You want all Selenium tests in your project to share a common driver setup. Where should you define the fixture?",
        "In conftest.py at the project root", "In each test file", "In a setup.py file", "In a global config.py",
        "A", "conftest.py fixtures are automatically available to all tests in the directory and subdirectories.")

    add(SUBJECT, "Test Framework Integration", "Medium", "scenario",
        "Your test suite has 100 Selenium tests and takes too long to run sequentially. How do you speed it up?",
        "Use pytest-xdist with -n auto to run tests in parallel",
        "Reduce the number of tests", "Remove all waits", "Use a faster computer",
        "A", "pytest-xdist distributes tests across multiple processes for parallel execution.")

    add(SUBJECT, "Test Framework Integration", "Medium", "scenario",
        "You need to skip Selenium tests when Chrome is not installed. How do you handle this?",
        "Use pytest.mark.skipif with a condition that checks for Chrome availability",
        "Remove the tests", "Use try/except in every test", "Always install Chrome first",
        "A", "skipif conditionally skips tests based on a boolean condition, like checking browser availability.")

    add(SUBJECT, "Test Framework Integration", "Hard", "scenario",
        "Your Selenium tests are flaky due to timing issues. After fixing wait strategies, some tests still occasionally fail. How do you handle the remaining flakiness?",
        "Use pytest-rerunfailures to automatically retry failed tests with a limit",
        "Increase all timeouts to 60 seconds", "Mark tests as expected failures", "Remove the flaky tests",
        "A", "pytest-rerunfailures provides automatic retry logic with configurable limits for handling residual flakiness.")

    add(SUBJECT, "Test Framework Integration", "Hard", "scenario",
        "You need to generate a detailed HTML report with screenshots, execution time, and environment info. What combination of tools do you use?",
        "pytest-html plugin with custom conftest.py hooks for screenshot attachment",
        "Print statements to a file", "pytest --verbose only", "Custom report generator from scratch",
        "A", "pytest-html combined with hooks for screenshots and metadata creates comprehensive HTML reports.")

    # Code Completion (5)
    add(SUBJECT, "Test Framework Integration", "Easy", "code_completion",
        "Complete the pytest fixture for WebDriver setup and teardown.",
        "webdriver.Chrome(); yield driver; driver.quit()",
        "webdriver.Chrome(); return driver; driver.close()",
        "Chrome(); yield; quit()",
        "webdriver.start(); yield driver; webdriver.stop()",
        "A", "yield-based fixture sets up the driver, yields it for the test, then quits on teardown.",
        "@pytest.fixture\ndef driver():\n    driver = ___\n    ___\n    ___")

    add(SUBJECT, "Test Framework Integration", "Medium", "code_completion",
        "Complete the parametrized test for multiple browsers.",
        "@pytest.mark.parametrize('browser', ['chrome', 'firefox'])",
        "@pytest.parametrize(['chrome', 'firefox'])",
        "@pytest.mark.browsers('chrome', 'firefox')",
        "@pytest.param('browser', ['chrome', 'firefox'])",
        "A", "parametrize decorator takes parameter name and values list.",
        "___\ndef test_homepage(browser):\n    pass")

    add(SUBJECT, "Test Framework Integration", "Medium", "code_completion",
        "Complete the conftest.py to add environment info to HTML report.",
        "config._metadata['Browser'] = 'Chrome'; config._metadata['Environment'] = 'Staging'",
        "config.set_env('Chrome', 'Staging')",
        "config.report.add('Chrome', 'Staging')",
        "config.html_metadata = {'Browser': 'Chrome'}",
        "A", "Adding to config._metadata populates the Environment section of pytest-html reports.",
        "def pytest_configure(config):\n    ___")

    add(SUBJECT, "Test Framework Integration", "Hard", "code_completion",
        "Complete the marker to skip a test if a condition is met.",
        "@pytest.mark.skipif(not shutil.which('chromedriver'), reason='chromedriver not found')",
        "@pytest.skip('chromedriver not found')",
        "@pytest.mark.skip_when(no_chromedriver=True)",
        "@skipIf(not chromedriver_exists())",
        "A", "skipif with a condition and reason skips the test when the condition is True.",
        "import shutil\n___\ndef test_chrome_feature(driver):\n    pass")

    add(SUBJECT, "Test Framework Integration", "Hard", "code_completion",
        "Complete the allure attachment for screenshots on failure.",
        "allure.attach(driver.get_screenshot_as_png(), name='screenshot', attachment_type=allure.attachment_type.PNG)",
        "allure.screenshot(driver)",
        "allure.add_image(driver.screenshot())",
        "allure.attach_screenshot(driver)",
        "A", "allure.attach with PNG attachment type embeds screenshots in Allure reports.",
        "import allure\nif test_failed:\n    ___")

    # ===================== CROSS-BROWSER =====================
    # MCQ (10)
    add(SUBJECT, "Cross-Browser", "Easy", "mcq",
        "Which browsers does Selenium WebDriver support?",
        "Chrome, Firefox, Edge, Safari, and more", "Chrome only", "Chrome and Firefox only", "All browsers without drivers",
        "A", "Selenium supports multiple browsers including Chrome, Firefox, Edge, Safari, Opera, and more.")

    add(SUBJECT, "Cross-Browser", "Easy", "mcq",
        "Which WebDriver class is used for Microsoft Edge?",
        "webdriver.Edge()", "webdriver.MicrosoftEdge()", "webdriver.EdgeChromium()", "webdriver.MSEdge()",
        "A", "webdriver.Edge() creates an Edge browser instance using EdgeDriver.")

    add(SUBJECT, "Cross-Browser", "Easy", "mcq",
        "Which WebDriver class is used for Safari?",
        "webdriver.Safari()", "webdriver.AppleSafari()", "webdriver.WebKit()", "webdriver.MacBrowser()",
        "A", "webdriver.Safari() creates a Safari browser instance using SafariDriver.")

    add(SUBJECT, "Cross-Browser", "Medium", "mcq",
        "How do you enable Safari's WebDriver feature?",
        "Run 'safaridriver --enable' in Terminal", "Install SafariDriver separately", "Enable in Safari Preferences > Developer", "It is enabled by default",
        "A", "Safari requires running safaridriver --enable once to activate WebDriver support.")

    add(SUBJECT, "Cross-Browser", "Medium", "mcq",
        "What is the main challenge of cross-browser testing?",
        "Different browsers may render pages differently and have varying CSS/JS support",
        "Selenium does not support multiple browsers", "Each browser needs different code",
        "Cross-browser testing is impossible with Selenium",
        "A", "Browser rendering differences, CSS support variations, and JavaScript behavior can cause cross-browser issues.")

    add(SUBJECT, "Cross-Browser", "Medium", "mcq",
        "Which options class is used for Edge browser configuration?",
        "webdriver.EdgeOptions()", "webdriver.EdgeConfig()", "webdriver.EdgePreferences()", "webdriver.MSEdgeOptions()",
        "A", "EdgeOptions() configures Edge browser settings, similar to ChromeOptions for Chrome.")

    add(SUBJECT, "Cross-Browser", "Hard", "mcq",
        "Why might an XPath locator work in Chrome but fail in Safari?",
        "Safari's XPath implementation may handle whitespace or namespace differently",
        "Safari does not support XPath", "Chrome extends XPath spec", "XPath is deprecated in Safari",
        "A", "Different browsers may have subtle differences in XPath implementation.")

    add(SUBJECT, "Cross-Browser", "Hard", "mcq",
        "What is a best practice for writing cross-browser compatible locators?",
        "Prefer CSS selectors and stable attributes; avoid browser-specific behaviors",
        "Always use XPath", "Use JavaScript for all interactions", "Write separate locators for each browser",
        "A", "CSS selectors are more consistently implemented across browsers than XPath.")

    add(SUBJECT, "Cross-Browser", "Hard", "mcq",
        "How do you handle browser-specific behavior differences in your test suite?",
        "Use conditional logic based on browser capabilities or create browser-specific helper methods",
        "Write separate test suites for each browser", "Ignore browser differences",
        "Only test on Chrome",
        "A", "Conditional logic or abstraction layers handle browser-specific behaviors cleanly.")

    add(SUBJECT, "Cross-Browser", "Medium", "mcq",
        "Which cloud-based services provide cross-browser Selenium testing?",
        "BrowserStack, Sauce Labs, LambdaTest", "AWS only", "Azure DevOps only", "GitHub Actions only",
        "A", "Cloud services like BrowserStack and Sauce Labs provide access to many browser/OS combinations.")

    # Output (5)
    add(SUBJECT, "Cross-Browser", "Easy", "output",
        "What does this code demonstrate?",
        "Creating different browser drivers based on a browser name parameter",
        "Running all browsers simultaneously", "Installing browsers", "Browser detection",
        "A", "A factory function creates the appropriate WebDriver based on the browser name string.",
        "def get_driver(browser):\n    if browser == 'chrome':\n        return webdriver.Chrome()\n    elif browser == 'firefox':\n        return webdriver.Firefox()\n    elif browser == 'edge':\n        return webdriver.Edge()\nprint('Browser factory defined')")

    add(SUBJECT, "Cross-Browser", "Medium", "output",
        "What does this code print?",
        "The browser name from capabilities (e.g., 'chrome')", "Chrome", "WebDriver", "The user agent",
        "A", "capabilities['browserName'] returns the name of the browser being driven.",
        "driver = webdriver.Chrome()\nprint(driver.capabilities['browserName'])\ndriver.quit()")

    add(SUBJECT, "Cross-Browser", "Medium", "output",
        "What does this parametrized test achieve?",
        "Runs the same test function on Chrome, Firefox, and Edge sequentially",
        "Runs on all browsers simultaneously", "Tests only Chrome", "Tests browser compatibility",
        "A", "pytest.mark.parametrize runs the test once for each browser value.",
        "@pytest.mark.parametrize('browser', ['chrome', 'firefox', 'edge'])\ndef test_title(browser):\n    driver = get_driver(browser)\n    driver.get('https://example.com')\n    assert driver.title == 'Example Domain'\n    driver.quit()\nprint('Cross-browser test defined')")

    add(SUBJECT, "Cross-Browser", "Hard", "output",
        "What does this code do?",
        "Gets the browser version from driver capabilities",
        "Updates the browser", "Checks for updates", "Installs a specific version",
        "A", "capabilities['browserVersion'] returns the version of the browser being used.",
        "driver = webdriver.Chrome()\nversion = driver.capabilities.get('browserVersion', 'unknown')\nprint(f'Browser version: {version}')\ndriver.quit()")

    add(SUBJECT, "Cross-Browser", "Hard", "output",
        "What does this factory pattern provide?",
        "A centralized way to create browsers with common options for any supported browser",
        "Automatic browser installation", "Browser auto-detection", "Test parallelization",
        "A", "A factory centralizes browser creation logic and common options application.",
        "class BrowserFactory:\n    @staticmethod\n    def create(name, headless=False):\n        if name == 'chrome':\n            opts = webdriver.ChromeOptions()\n            if headless: opts.add_argument('--headless')\n            return webdriver.Chrome(options=opts)\n        elif name == 'firefox':\n            opts = webdriver.FirefoxOptions()\n            if headless: opts.add_argument('--headless')\n            return webdriver.Firefox(options=opts)\nprint('BrowserFactory defined')")

    # Scenario (5)
    add(SUBJECT, "Cross-Browser", "Easy", "scenario",
        "Your client requires testing on Chrome, Firefox, and Edge. What is the most efficient approach?",
        "Create a parameterized test suite that runs on all three browsers",
        "Create three separate test suites", "Test only on Chrome since it has the most users", "Use browser emulation in Chrome",
        "A", "Parameterized testing runs the same tests across all browsers with minimal code duplication.")

    add(SUBJECT, "Cross-Browser", "Medium", "scenario",
        "A CSS animation works in Chrome but not in Firefox. How should you handle this in your tests?",
        "Add browser-specific assertions or skip the animation check for Firefox",
        "Remove the animation test", "Fix the CSS (not a testing concern)", "Use JavaScript to force the animation",
        "A", "Browser-specific conditions in tests handle known rendering differences appropriately.")

    add(SUBJECT, "Cross-Browser", "Medium", "scenario",
        "You need to test on Safari but only have Windows machines. What is the solution?",
        "Use a cloud service like BrowserStack or Sauce Labs that provides macOS Safari instances",
        "Install Safari on Windows", "Emulate Safari in Chrome", "Skip Safari testing",
        "A", "Cloud-based testing platforms provide access to Safari on macOS without needing Apple hardware.")

    add(SUBJECT, "Cross-Browser", "Hard", "scenario",
        "Your cross-browser tests take 3 hours to run sequentially. How do you reduce this time?",
        "Use Selenium Grid or cloud service with parallel execution across browsers",
        "Reduce test count", "Remove slow browsers", "Use headless mode only",
        "A", "Parallel execution on Grid or cloud services runs browser tests simultaneously.")

    add(SUBJECT, "Cross-Browser", "Hard", "scenario",
        "An element click fails in Edge but works in Chrome. The element is visible in both browsers. What is likely the issue and fix?",
        "Edge may need a scroll to bring the element into the clickable area; use scrollIntoView before clicking",
        "Edge does not support clicking", "Upgrade Edge", "Use a different locator for Edge",
        "A", "Different browsers may have slightly different viewport handling; scrolling into view often resolves click issues.")

    # Code Completion (3)
    add(SUBJECT, "Cross-Browser", "Easy", "code_completion",
        "Complete the browser factory function.",
        "webdriver.Chrome()", "Chrome()", "selenium.Chrome()", "browser.Chrome()",
        "A", "webdriver.Chrome() creates a new Chrome WebDriver instance.",
        "def create_driver(browser_name):\n    if browser_name == 'chrome':\n        return ___\n    elif browser_name == 'firefox':\n        return webdriver.Firefox()")

    add(SUBJECT, "Cross-Browser", "Medium", "code_completion",
        "Complete the code to get browser capabilities after driver creation.",
        "driver.capabilities", "driver.get_capabilities()", "driver.browser_info()", "driver.config",
        "A", "The capabilities property returns a dictionary of browser capabilities.",
        "driver = webdriver.Chrome()\nbrowser_info = ___\nprint(browser_info['browserName'])")

    add(SUBJECT, "Cross-Browser", "Hard", "code_completion",
        "Complete the code to create an Edge driver with options.",
        "webdriver.EdgeOptions(); webdriver.Edge(options=options)",
        "webdriver.EdgeConfig(); webdriver.Edge(config=options)",
        "EdgeOptions(); Edge(options)",
        "webdriver.Edge.Options(); webdriver.Edge(opts=options)",
        "A", "EdgeOptions configures Edge settings, passed to the Edge WebDriver constructor.",
        "options = ___\noptions.add_argument('--headless')\ndriver = ___")

    # ===================== HEADLESS =====================
    # MCQ (10)
    add(SUBJECT, "Headless", "Easy", "mcq",
        "What is headless browser testing?",
        "Running browser tests without a visible browser window", "Testing without a framework",
        "Testing on a server without a monitor", "Testing with a lightweight browser",
        "A", "Headless mode runs the browser without rendering a visible UI, which is faster and suitable for CI/CD.")

    add(SUBJECT, "Headless", "Easy", "mcq",
        "How do you run Chrome in headless mode?",
        "options.add_argument('--headless')", "options.headless = True", "driver.set_headless(True)", "ChromeHeadless()",
        "A", "The --headless argument runs Chrome without a visible browser window.")

    add(SUBJECT, "Headless", "Easy", "mcq",
        "How do you run Firefox in headless mode?",
        "options.add_argument('--headless')", "options.headless_mode = True", "driver.headless()", "FirefoxHeadless()",
        "A", "Firefox also uses --headless argument via FirefoxOptions.")

    add(SUBJECT, "Headless", "Medium", "mcq",
        "What is the main advantage of headless browser testing?",
        "Faster execution and no need for a display server", "Better test coverage",
        "More accurate rendering", "Easier debugging",
        "A", "Headless mode is faster because it skips rendering and does not require a display.")

    add(SUBJECT, "Headless", "Medium", "mcq",
        "What is the new headless mode introduced in Chrome 112+?",
        "--headless=new (uses the regular Chrome in headless mode)", "--headless=chrome", "--hidden-mode", "--no-display",
        "A", "Chrome's new headless mode provides the same capabilities as the regular browser without the old limitations.")

    add(SUBJECT, "Headless", "Medium", "mcq",
        "Which argument should accompany --headless in CI environments for Chrome?",
        "--no-sandbox", "--safe-mode", "--ci-mode", "--auto-headless",
        "A", "--no-sandbox is often needed in CI environments (like Docker) where Chrome runs as root.")

    add(SUBJECT, "Headless", "Medium", "mcq",
        "Can headless browsers take screenshots?",
        "Yes, screenshots work the same as in headed mode", "No, screenshots require a visible window",
        "Only with JavaScript", "Only partial screenshots",
        "A", "Headless browsers can take full screenshots just like headed browsers.")

    add(SUBJECT, "Headless", "Hard", "mcq",
        "What is a common issue with headless browser testing that does not occur in headed mode?",
        "Default viewport size may differ, causing responsive layout differences",
        "JavaScript does not execute", "CSS is not applied", "Cookies are not supported",
        "A", "Headless browsers may have a different default window size, affecting responsive behavior.")

    add(SUBJECT, "Headless", "Hard", "mcq",
        "How do you debug a test that passes in headed mode but fails in headless mode?",
        "Take screenshots, check viewport size, and verify that the element is within the viewport",
        "Headless failures are always false negatives", "Switch to a different browser", "Add time.sleep everywhere",
        "A", "Viewport differences, missing GPU rendering, and element visibility can all cause headless-specific failures.")

    add(SUBJECT, "Headless", "Hard", "mcq",
        "Which argument ensures a consistent window size in headless Chrome?",
        "--window-size=1920,1080", "--viewport=1920x1080", "--resolution=1920,1080", "--display-size=1920,1080",
        "A", "--window-size sets the browser viewport dimensions, ensuring consistent rendering in headless mode.")

    # Output (5)
    add(SUBJECT, "Headless", "Easy", "output",
        "What does this code configure?",
        "A Chrome browser running in headless mode",
        "A regular Chrome browser", "A Firefox headless browser", "A remote browser",
        "A", "The --headless argument configures Chrome to run without a visible window.",
        "from selenium import webdriver\noptions = webdriver.ChromeOptions()\noptions.add_argument('--headless')\ndriver = webdriver.Chrome(options=options)\nprint('Headless Chrome started')")

    add(SUBJECT, "Headless", "Medium", "output",
        "Can this headless browser take a screenshot?",
        "Yes, the screenshot will be saved successfully",
        "No, it will fail", "It saves a blank image", "It raises an error",
        "A", "Headless browsers support screenshots identically to headed mode.",
        "options = webdriver.ChromeOptions()\noptions.add_argument('--headless')\ndriver = webdriver.Chrome(options=options)\ndriver.get('https://example.com')\nresult = driver.save_screenshot('headless.png')\nprint(result)")

    add(SUBJECT, "Headless", "Medium", "output",
        "What does this code print?",
        "The page title (e.g., 'Example Domain')", "None", "An error", "Empty string",
        "A", "Headless Chrome loads pages and returns titles just like headed mode.",
        "options = webdriver.ChromeOptions()\noptions.add_argument('--headless')\ndriver = webdriver.Chrome(options=options)\ndriver.get('https://example.com')\nprint(driver.title)\ndriver.quit()")

    add(SUBJECT, "Headless", "Hard", "output",
        "What does this headless configuration set up?",
        "A headless Chrome with explicit window size and sandbox disabled for CI",
        "A headed Chrome", "A headless Firefox", "A mobile emulator",
        "A", "Multiple arguments configure headless mode, window size, and sandbox settings for CI environments.",
        "options = webdriver.ChromeOptions()\noptions.add_argument('--headless=new')\noptions.add_argument('--window-size=1920,1080')\noptions.add_argument('--no-sandbox')\noptions.add_argument('--disable-dev-shm-usage')\ndriver = webdriver.Chrome(options=options)\nprint('CI-ready headless Chrome')")

    add(SUBJECT, "Headless", "Hard", "output",
        "What does this code verify?",
        "Whether the browser is running in headless mode by checking the user agent",
        "The browser version", "The window size", "The page load time",
        "A", "Headless Chrome often includes 'HeadlessChrome' in its user agent string.",
        "options = webdriver.ChromeOptions()\noptions.add_argument('--headless')\ndriver = webdriver.Chrome(options=options)\nua = driver.execute_script('return navigator.userAgent')\nprint('Headless' in ua)\ndriver.quit()")

    # Scenario (5)
    add(SUBJECT, "Headless", "Easy", "scenario",
        "Your CI server has no display server (no GUI). How do you run Selenium tests?",
        "Use headless browser mode with --headless argument",
        "Install a virtual display", "Use Selenium Grid only", "Tests cannot run without a display",
        "A", "Headless mode allows browser tests to run without any display server or GUI.")

    add(SUBJECT, "Headless", "Medium", "scenario",
        "Your headless test works locally but fails in Docker. The error mentions shared memory. What is the fix?",
        "Add --disable-dev-shm-usage argument or increase Docker shared memory",
        "Use a different browser", "Install X11 in Docker", "Use a larger Docker image",
        "A", "--disable-dev-shm-usage prevents Chrome from using /dev/shm, which is limited in Docker.")

    add(SUBJECT, "Headless", "Medium", "scenario",
        "A test clicks a responsive menu that appears at mobile width. In headless mode, the menu is not visible. What is the issue?",
        "The default headless window size is too large; set --window-size to a mobile dimension",
        "Headless mode does not support responsive design", "The menu uses JavaScript not available in headless",
        "Headless mode ignores CSS media queries",
        "A", "Setting appropriate window dimensions ensures responsive elements render correctly in headless mode.")

    add(SUBJECT, "Headless", "Hard", "scenario",
        "You need to generate PDF files from web pages in your test pipeline. Can headless Chrome help?",
        "Yes, use execute_cdp_cmd with Page.printToPDF to generate PDFs",
        "No, headless Chrome cannot generate PDFs", "Use a separate PDF library only", "Take screenshots and convert to PDF",
        "A", "CDP command Page.printToPDF generates PDF output from the current page in headless Chrome.")

    add(SUBJECT, "Headless", "Hard", "scenario",
        "Your headless tests pass but you suspect rendering differences from headed mode. How do you verify?",
        "Compare screenshots from headless and headed modes using visual comparison tools",
        "Headless rendering is always identical to headed", "Check the HTML source only", "Compare page load times",
        "A", "Visual comparison between headless and headed screenshots reveals rendering differences.")

    # Code Completion (5)
    add(SUBJECT, "Headless", "Easy", "code_completion",
        "Complete the code to run Chrome in headless mode.",
        "options.add_argument('--headless')",
        "options.headless(True)", "options.set_headless()", "options.no_gui()",
        "A", "The --headless argument enables headless browser mode.",
        "options = webdriver.ChromeOptions()\n___\ndriver = webdriver.Chrome(options=options)")

    add(SUBJECT, "Headless", "Medium", "code_completion",
        "Complete the headless Chrome configuration for CI/CD.",
        "options.add_argument('--headless'); options.add_argument('--no-sandbox'); options.add_argument('--disable-dev-shm-usage')",
        "options.ci_mode(True)",
        "options.add_argument('--ci')",
        "options.headless_ci()",
        "A", "These three arguments are the standard configuration for headless Chrome in CI environments.",
        "options = webdriver.ChromeOptions()\n___\ndriver = webdriver.Chrome(options=options)")

    add(SUBJECT, "Headless", "Medium", "code_completion",
        "Complete the code to set a specific window size for headless testing.",
        "options.add_argument('--window-size=1366,768')",
        "options.set_size(1366, 768)",
        "options.window = (1366, 768)",
        "driver.set_window_size(1366, 768)",
        "A", "--window-size argument sets the viewport dimensions at browser launch.",
        "options = webdriver.ChromeOptions()\noptions.add_argument('--headless')\n___\ndriver = webdriver.Chrome(options=options)")

    add(SUBJECT, "Headless", "Hard", "code_completion",
        "Complete the code to generate a PDF from a web page using headless Chrome.",
        "driver.execute_cdp_cmd('Page.printToPDF', {'landscape': False, 'printBackground': True})",
        "driver.save_as_pdf('page.pdf')",
        "driver.print_to_pdf()",
        "driver.execute_script('window.print()')",
        "A", "CDP Page.printToPDF generates PDF output from the rendered page.",
        "options = webdriver.ChromeOptions()\noptions.add_argument('--headless=new')\ndriver = webdriver.Chrome(options=options)\ndriver.get('https://example.com')\nresult = ___")

    add(SUBJECT, "Headless", "Hard", "code_completion",
        "Complete the code to use the new headless mode in Chrome 112+.",
        "options.add_argument('--headless=new')",
        "options.add_argument('--headless-new')",
        "options.add_argument('--headless-v2')",
        "options.add_argument('--new-headless')",
        "A", "--headless=new uses Chrome's new headless implementation with full browser capabilities.",
        "options = webdriver.ChromeOptions()\n___\ndriver = webdriver.Chrome(options=options)")

    # ===================== MOBILE =====================
    # MCQ (10)
    add(SUBJECT, "Mobile", "Easy", "mcq",
        "Which tool extends Selenium for mobile app automation?",
        "Appium", "Selenium Mobile", "MobileDriver", "PhoneGap",
        "A", "Appium extends the WebDriver protocol for native, hybrid, and mobile web app testing.")

    add(SUBJECT, "Mobile", "Easy", "mcq",
        "How can you emulate a mobile device viewport in Chrome using Selenium?",
        "Use ChromeOptions with mobileEmulation experimental option", "Use a mobile-specific WebDriver",
        "Resize the window only", "Use a mobile user agent only",
        "A", "Chrome's mobile emulation feature simulates mobile device viewport, user agent, and touch events.")

    add(SUBJECT, "Mobile", "Easy", "mcq",
        "What does mobile emulation in Chrome simulate?",
        "Device viewport, user agent, and touch events", "Only the screen size",
        "Only the user agent", "Real mobile hardware",
        "A", "Mobile emulation simulates viewport dimensions, device pixel ratio, user agent, and touch capabilities.")

    add(SUBJECT, "Mobile", "Medium", "mcq",
        "How do you set mobile emulation for a specific device in Chrome?",
        "options.add_experimental_option('mobileEmulation', {'deviceName': 'iPhone 12 Pro'})",
        "options.add_argument('--mobile=iPhone12')", "options.mobile_device = 'iPhone 12 Pro'",
        "driver.emulate_device('iPhone 12 Pro')",
        "A", "The mobileEmulation experimental option with deviceName emulates a specific device.")

    add(SUBJECT, "Mobile", "Medium", "mcq",
        "What is the difference between mobile emulation and actual mobile testing?",
        "Emulation simulates device properties in desktop Chrome; actual testing uses real devices or emulators",
        "There is no difference", "Emulation is more accurate", "Actual testing is slower",
        "A", "Emulation approximates mobile behavior but cannot fully replicate real device rendering and performance.")

    add(SUBJECT, "Mobile", "Medium", "mcq",
        "Which capability is needed for Appium to test an Android app?",
        "platformName, deviceName, and app or appPackage/appActivity",
        "Only the APK path", "Just the device name", "browserName only",
        "A", "Appium requires platform, device, and app capabilities to establish a session.")

    add(SUBJECT, "Mobile", "Hard", "mcq",
        "How do you set custom mobile emulation metrics (width, height, pixel ratio) in Chrome?",
        "options.add_experimental_option('mobileEmulation', {'deviceMetrics': {'width': 375, 'height': 812, 'pixelRatio': 3}})",
        "options.add_argument('--mobile-metrics=375,812,3')", "driver.set_mobile_size(375, 812, 3)",
        "options.mobile_metrics = (375, 812, 3)",
        "A", "Custom deviceMetrics in mobileEmulation allow precise control over viewport dimensions and pixel ratio.")

    add(SUBJECT, "Mobile", "Hard", "mcq",
        "Which Selenium 4 feature can be used for mobile device emulation without the experimental option?",
        "CDP Emulation.setDeviceMetricsOverride", "driver.mobile_mode()", "options.device_emulation()", "driver.set_device()",
        "A", "CDP command Emulation.setDeviceMetricsOverride provides more control over device emulation.")

    add(SUBJECT, "Mobile", "Hard", "mcq",
        "What is the purpose of setting touch event emulation in mobile testing?",
        "To simulate touch interactions like tap, swipe, and pinch instead of mouse events",
        "To enable multitouch on desktop", "To test keyboard input", "To improve performance",
        "A", "Touch emulation ensures the web application responds to touch events as it would on a real mobile device.")

    add(SUBJECT, "Mobile", "Medium", "mcq",
        "How do you set a mobile user agent in Chrome without full mobile emulation?",
        "options.add_argument('--user-agent=<mobile UA string>')", "driver.set_user_agent('mobile')",
        "options.user_agent = 'mobile'", "driver.execute_script('navigator.userAgent = ...')",
        "A", "The --user-agent argument overrides Chrome's user agent string.")

    # Output (5)
    add(SUBJECT, "Mobile", "Easy", "output",
        "What does this code set up?",
        "Chrome browser emulating an iPhone 12 Pro device",
        "A real iPhone connection", "A mobile app test", "An Android emulator",
        "A", "mobileEmulation with deviceName configures Chrome to simulate the specified device.",
        "options = webdriver.ChromeOptions()\noptions.add_experimental_option('mobileEmulation', {'deviceName': 'iPhone 12 Pro'})\ndriver = webdriver.Chrome(options=options)\nprint('Mobile emulation active')")

    add(SUBJECT, "Mobile", "Medium", "output",
        "What viewport size will this emulation use?",
        "375x812 pixels with 3x pixel ratio", "1920x1080", "320x480", "The default Chrome size",
        "A", "Custom deviceMetrics set the exact viewport dimensions and pixel ratio.",
        "mobile = {'deviceMetrics': {'width': 375, 'height': 812, 'pixelRatio': 3},\n          'userAgent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'}\noptions = webdriver.ChromeOptions()\noptions.add_experimental_option('mobileEmulation', mobile)\nprint('Custom mobile emulation configured')")

    add(SUBJECT, "Mobile", "Medium", "output",
        "What does this CDP command accomplish?",
        "Enables touch event emulation in the browser",
        "Disables touch events", "Enables multitouch", "Simulates a specific touch gesture",
        "A", "Emulation.setTouchEmulationEnabled activates touch event simulation.",
        "driver.execute_cdp_cmd('Emulation.setTouchEmulationEnabled', {\n    'enabled': True,\n    'maxTouchPoints': 5\n})\nprint('Touch emulation enabled')")

    add(SUBJECT, "Mobile", "Hard", "output",
        "What does this Appium desired capabilities dictionary configure?",
        "An Android Chrome browser test session on a Pixel 5 device",
        "An iOS Safari session", "A desktop Chrome session", "A mobile app test",
        "A", "The capabilities specify Android platform, Chrome browser, and Pixel 5 device.",
        "caps = {\n    'platformName': 'Android',\n    'browserName': 'Chrome',\n    'deviceName': 'Pixel 5',\n    'automationName': 'UiAutomator2'\n}\nprint('Android Chrome caps defined')")

    add(SUBJECT, "Mobile", "Hard", "output",
        "What does this code test?",
        "Whether the responsive design shows a mobile navigation menu at mobile viewport width",
        "Desktop navigation", "API responsiveness", "App performance",
        "A", "Setting mobile viewport size and checking for mobile-specific elements tests responsive design.",
        "options = webdriver.ChromeOptions()\noptions.add_experimental_option('mobileEmulation', {'deviceName': 'Nexus 5'})\ndriver = webdriver.Chrome(options=options)\ndriver.get('https://example.com')\nmobile_menu = driver.find_elements(By.CSS_SELECTOR, '.mobile-nav')\nprint(f'Mobile menu present: {len(mobile_menu) > 0}')")

    # Scenario (5)
    add(SUBJECT, "Mobile", "Easy", "scenario",
        "You need to test how your responsive website looks on an iPhone. You do not have a physical iPhone. What can you do?",
        "Use Chrome's mobile emulation with iPhone device name",
        "You cannot test without an iPhone", "Use Safari on Windows", "Resize the Chrome window manually",
        "A", "Chrome's mobile emulation simulates iPhone viewport, user agent, and touch events.")

    add(SUBJECT, "Mobile", "Medium", "scenario",
        "Your mobile web test needs to verify that a hamburger menu appears on small screens. How do you automate this?",
        "Set mobile emulation or a small window size, then check if the hamburger menu element is visible",
        "Click the hamburger menu on desktop", "Use JavaScript to show the menu", "Check CSS media queries in code",
        "A", "Setting an appropriate viewport size triggers responsive design, making the hamburger menu visible.")

    add(SUBJECT, "Mobile", "Medium", "scenario",
        "You need to test your web app on both iOS Safari and Android Chrome. Which approach is most practical?",
        "Use Appium or a cloud service like BrowserStack for real device/emulator testing",
        "Use Chrome mobile emulation for both", "Test only on desktop", "Use simulators on a Mac",
        "A", "Appium and cloud services provide real device and emulator testing across both platforms.")

    add(SUBJECT, "Mobile", "Hard", "scenario",
        "Your mobile test needs to simulate a swipe gesture on a carousel. How can you achieve this with Selenium?",
        "Use TouchActions or ActionChains with pointer input to simulate swipe coordinates",
        "Use element.swipe()", "Use JavaScript scrollIntoView", "Use driver.swipe()",
        "A", "ActionChains with pointer inputs or CDP touch emulation can simulate swipe gestures.")

    add(SUBJECT, "Mobile", "Hard", "scenario",
        "You need to test your PWA (Progressive Web App) on mobile. What is the best Selenium approach?",
        "Use Chrome mobile emulation with PWA-specific capabilities (offline mode, service worker testing via CDP)",
        "PWAs cannot be tested with Selenium", "Test only the desktop version",
        "Use Appium with a native app wrapper",
        "A", "Chrome mobile emulation combined with CDP commands can test PWA features like offline mode and service workers.")

    # Code Completion (5)
    add(SUBJECT, "Mobile", "Easy", "code_completion",
        "Complete the code to enable mobile emulation for an iPhone X.",
        "options.add_experimental_option('mobileEmulation', {'deviceName': 'iPhone X'})",
        "options.add_argument('--device=iPhoneX')",
        "options.mobile = 'iPhone X'",
        "options.emulate('iPhone X')",
        "A", "mobileEmulation experimental option with deviceName enables built-in device emulation.",
        "options = webdriver.ChromeOptions()\n___\ndriver = webdriver.Chrome(options=options)")

    add(SUBJECT, "Mobile", "Medium", "code_completion",
        "Complete the code to set custom mobile device metrics.",
        "options.add_experimental_option('mobileEmulation', {'deviceMetrics': {'width': 360, 'height': 640, 'pixelRatio': 3.0}, 'userAgent': ua})",
        "options.set_mobile(360, 640, 3.0, ua)",
        "options.mobile_config(width=360, height=640)",
        "options.device_metrics = {'w': 360, 'h': 640}",
        "A", "Custom deviceMetrics and userAgent provide precise mobile emulation control.",
        "options = webdriver.ChromeOptions()\nua = 'Mozilla/5.0 (Linux; Android 11; Pixel 5)'\n___")

    add(SUBJECT, "Mobile", "Medium", "code_completion",
        "Complete the code to set a mobile user agent string.",
        "options.add_argument('--user-agent=' + mobile_ua)",
        "options.user_agent = mobile_ua",
        "driver.set_user_agent(mobile_ua)",
        "options.set_ua(mobile_ua)",
        "A", "--user-agent argument overrides the browser's user agent string.",
        "options = webdriver.ChromeOptions()\nmobile_ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'\n___")

    add(SUBJECT, "Mobile", "Hard", "code_completion",
        "Complete the code to emulate a mobile device using CDP.",
        "driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {'width': 375, 'height': 812, 'deviceScaleFactor': 3, 'mobile': True})",
        "driver.set_mobile_metrics(375, 812, 3)",
        "driver.cdp_mobile(375, 812)",
        "driver.emulate_mobile(width=375, height=812)",
        "A", "CDP Emulation.setDeviceMetricsOverride provides fine-grained device emulation control.",
        "driver = webdriver.Chrome()\n___")

    add(SUBJECT, "Mobile", "Hard", "code_completion",
        "Complete the Appium desired capabilities for Android Chrome testing.",
        "'platformName': 'Android', 'browserName': 'Chrome', 'deviceName': 'emulator-5554', 'automationName': 'UiAutomator2'",
        "'platform': 'Android', 'browser': 'Chrome'",
        "'os': 'Android', 'driver': 'Chrome'",
        "'device': 'Android', 'app': 'Chrome'",
        "A", "Appium requires specific capabilities including platformName, browserName, deviceName, and automationName.",
        "caps = {\n    ___\n}\ndriver = webdriver.Remote('http://localhost:4723/wd/hub', options=caps)")

    # ===================== PARALLEL EXECUTION =====================
    # MCQ (10)
    add(SUBJECT, "Parallel Execution", "Easy", "mcq",
        "What is parallel test execution?",
        "Running multiple tests simultaneously across multiple processes or threads",
        "Running tests one after another very quickly",
        "Running the same test multiple times",
        "Running tests on multiple browsers sequentially",
        "A", "Parallel execution runs multiple tests at the same time, reducing total execution time.")

    add(SUBJECT, "Parallel Execution", "Easy", "mcq",
        "Which pytest plugin enables parallel test execution?",
        "pytest-xdist", "pytest-parallel", "pytest-multithread", "pytest-concurrent",
        "A", "pytest-xdist distributes tests across multiple workers for parallel execution.")

    add(SUBJECT, "Parallel Execution", "Easy", "mcq",
        "What command runs pytest tests in parallel with 4 workers?",
        "pytest -n 4", "pytest --parallel 4", "pytest --workers 4", "pytest -p 4",
        "A", "The -n flag in pytest-xdist specifies the number of parallel workers.")

    add(SUBJECT, "Parallel Execution", "Medium", "mcq",
        "What does 'pytest -n auto' do?",
        "Automatically sets the worker count to the number of CPU cores",
        "Runs tests automatically without configuration", "Auto-detects and runs failed tests",
        "Automatically parallelizes by browser",
        "A", "-n auto determines the optimal number of workers based on available CPU cores.")

    add(SUBJECT, "Parallel Execution", "Medium", "mcq",
        "What is a common challenge with parallel Selenium tests?",
        "Tests may interfere with each other if they share state (e.g., same user account, same database records)",
        "Selenium does not support parallel execution",
        "Browsers cannot run in parallel",
        "Tests always fail in parallel",
        "A", "Shared state between tests can cause race conditions and intermittent failures in parallel execution.")

    add(SUBJECT, "Parallel Execution", "Medium", "mcq",
        "How should each parallel test worker handle WebDriver instances?",
        "Each worker should create its own WebDriver instance",
        "All workers share one WebDriver", "Workers take turns using the WebDriver",
        "A central driver pool is required",
        "A", "Each parallel worker needs its own browser instance to avoid conflicts.")

    add(SUBJECT, "Parallel Execution", "Medium", "mcq",
        "Which Selenium Grid feature directly supports parallel execution?",
        "Multiple nodes that can run sessions simultaneously",
        "Sequential test queuing", "Test prioritization", "Automatic test distribution",
        "A", "Grid nodes can run multiple browser sessions simultaneously, enabling parallel test execution.")

    add(SUBJECT, "Parallel Execution", "Hard", "mcq",
        "How do you ensure test isolation in parallel Selenium execution?",
        "Use unique test data, separate user accounts, and independent browser instances per worker",
        "Run tests in a specific order", "Use a single database for all workers",
        "Share cookies between workers",
        "A", "Test isolation requires independent data, sessions, and browser instances for each parallel worker.")

    add(SUBJECT, "Parallel Execution", "Hard", "mcq",
        "What is the --dist flag in pytest-xdist used for?",
        "Controlling how tests are distributed across workers (loadscope, loadfile, load, etc.)",
        "Setting the distribution server", "Distributing across remote machines",
        "Controlling test output format",
        "A", "--dist controls the distribution algorithm: load (default), loadscope (group by class/module), loadfile, etc.")

    add(SUBJECT, "Parallel Execution", "Hard", "mcq",
        "How does Python's GIL affect parallel Selenium tests?",
        "pytest-xdist uses processes not threads, so GIL is not an issue",
        "GIL prevents any parallel execution", "GIL makes parallel tests slower",
        "GIL only affects headless tests",
        "A", "pytest-xdist spawns separate processes, each with its own GIL, so parallel execution works correctly.")

    # Output (5)
    add(SUBJECT, "Parallel Execution", "Easy", "output",
        "What does this pytest command do?",
        "Runs tests in parallel using 4 worker processes",
        "Runs 4 tests only", "Runs tests 4 times", "Runs tests with 4 browsers",
        "A", "-n 4 tells pytest-xdist to use 4 parallel worker processes.",
        "# Command: pytest -n 4 tests/\nprint('Running with 4 workers')")

    add(SUBJECT, "Parallel Execution", "Medium", "output",
        "What does this fixture ensure for parallel execution?",
        "Each worker gets its own independent browser instance",
        "All workers share one browser", "Browsers are reused between tests", "The browser runs in headless mode",
        "A", "A function-scoped fixture creates a new driver for each test, ensuring isolation in parallel execution.",
        "@pytest.fixture(scope='function')\ndef driver():\n    d = webdriver.Chrome()\n    yield d\n    d.quit()\nprint('Per-test driver fixture')")

    add(SUBJECT, "Parallel Execution", "Medium", "output",
        "What does this code accomplish for parallel tests?",
        "Creates unique test data using the worker ID to prevent data conflicts",
        "Creates random test data", "Uses the same data for all workers", "Generates UUIDs",
        "A", "Using a unique suffix per worker prevents parallel tests from conflicting on shared data.",
        "import os\nworker_id = os.environ.get('PYTEST_XDIST_WORKER', 'gw0')\ntest_email = f'user_{worker_id}@test.com'\nprint(f'Test email: {test_email}')")

    add(SUBJECT, "Parallel Execution", "Hard", "output",
        "What distribution strategy does this command use?",
        "Groups tests by their module/file, so all tests from one file run on the same worker",
        "Distributes tests randomly", "Runs all tests on all workers", "Groups tests alphabetically",
        "A", "--dist loadscope groups tests by their scope (module/class) to keep related tests on the same worker.",
        "# Command: pytest -n 4 --dist loadscope\nprint('Loadscope distribution')")

    add(SUBJECT, "Parallel Execution", "Hard", "output",
        "What does this configuration achieve?",
        "Limits Selenium Grid nodes to 3 concurrent sessions each, controlling parallel capacity",
        "Starts 3 Grid nodes", "Runs 3 tests total", "Sets timeout to 3 seconds",
        "A", "max-sessions limits the number of concurrent browser sessions per Grid node.",
        "# Grid node config: --max-sessions 3\nprint('Node limited to 3 sessions')")

    # Scenario (5)
    add(SUBJECT, "Parallel Execution", "Easy", "scenario",
        "Your test suite of 200 tests takes 2 hours to run. How can you reduce this?",
        "Run tests in parallel using pytest-xdist with -n auto",
        "Delete half the tests", "Remove all waits", "Use a faster computer only",
        "A", "Parallel execution with pytest-xdist can significantly reduce total execution time.")

    add(SUBJECT, "Parallel Execution", "Medium", "scenario",
        "Two parallel tests both try to update the same user's profile and one fails intermittently. How do you fix this?",
        "Give each test worker its own test user account to avoid data conflicts",
        "Add a lock mechanism", "Run these tests sequentially", "Increase timeouts",
        "A", "Unique test data per worker eliminates shared state conflicts in parallel execution.")

    add(SUBJECT, "Parallel Execution", "Medium", "scenario",
        "Your parallel tests create temporary files. Two workers write to the same file path. How do you resolve this?",
        "Include the worker ID in file paths: tmp_dir/worker_id/filename",
        "Use a shared directory", "Add file locks", "Delete files before each test",
        "A", "Worker-specific file paths prevent parallel tests from overwriting each other's files.")

    add(SUBJECT, "Parallel Execution", "Hard", "scenario",
        "You need to run 500 tests across Chrome, Firefox, and Edge in parallel. What infrastructure setup is optimal?",
        "Selenium Grid with multiple nodes for each browser type, combined with pytest-xdist",
        "Three separate test runs, one per browser", "One machine with all browsers",
        "Only cloud-based testing",
        "A", "Grid with multiple browser nodes plus pytest-xdist provides scalable parallel cross-browser execution.")

    add(SUBJECT, "Parallel Execution", "Hard", "scenario",
        "Your parallel test workers occasionally exceed the Grid's session capacity, causing tests to queue. How do you optimize this?",
        "Match the pytest-xdist worker count to Grid capacity, or use Grid 4 Docker dynamic scaling",
        "Remove worker limits", "Add more tests", "Increase timeouts to wait for sessions",
        "A", "Balancing worker count with Grid capacity and using dynamic scaling prevents session queuing.")

    # Code Completion (5)
    add(SUBJECT, "Parallel Execution", "Easy", "code_completion",
        "Complete the command to run tests in parallel with automatic worker count.",
        "pytest -n auto tests/", "pytest --parallel auto tests/", "pytest -w auto tests/", "pytest --workers=auto tests/",
        "A", "-n auto automatically determines the number of parallel workers based on CPU cores.",
        "# Run command:\n# ___")

    add(SUBJECT, "Parallel Execution", "Medium", "code_completion",
        "Complete the fixture to ensure each parallel worker gets a unique driver.",
        "@pytest.fixture(scope='function')", "@pytest.fixture(scope='session')", "@pytest.fixture(scope='module')", "@pytest.fixture(shared=True)",
        "A", "Function scope creates a new fixture instance for each test function, ensuring isolation.",
        "___\ndef driver():\n    d = webdriver.Chrome()\n    yield d\n    d.quit()")

    add(SUBJECT, "Parallel Execution", "Medium", "code_completion",
        "Complete the code to get the pytest-xdist worker ID for unique test data.",
        "os.environ.get('PYTEST_XDIST_WORKER', 'gw0')",
        "os.environ.get('WORKER_ID', '0')",
        "pytest.worker_id",
        "os.getpid()",
        "A", "PYTEST_XDIST_WORKER environment variable contains the worker identifier.",
        "import os\nworker_id = ___\nunique_user = f'testuser_{worker_id}'")

    add(SUBJECT, "Parallel Execution", "Hard", "code_completion",
        "Complete the pytest.ini configuration for parallel execution with loadscope distribution.",
        "addopts = -n auto --dist loadscope",
        "parallel = auto loadscope",
        "workers = auto scope",
        "xdist = auto loadscope",
        "A", "addopts with -n auto and --dist loadscope configures parallel execution with scoped distribution.",
        "[pytest]\n___")

    add(SUBJECT, "Parallel Execution", "Hard", "code_completion",
        "Complete the Docker Compose configuration for Selenium Grid with 5 Chrome nodes.",
        "image: selenium/node-chrome; environment: - SE_EVENT_BUS_HOST=hub; deploy: replicas: 5",
        "image: chrome-node; count: 5",
        "selenium/chrome x5",
        "nodes: 5 browser: chrome",
        "A", "Docker Compose with replicas scales the number of Chrome nodes in the Grid.",
        "# docker-compose.yml chrome node service:\n# ___")

    # ===================== REPORTING =====================
    # MCQ (11)
    add(SUBJECT, "Reporting", "Easy", "mcq",
        "Which pytest plugin generates HTML test reports?",
        "pytest-html", "pytest-report", "pytest-htmlgen", "pytest-web-report",
        "A", "pytest-html is the standard plugin for generating HTML test reports from pytest.")

    add(SUBJECT, "Reporting", "Easy", "mcq",
        "How do you generate an HTML report using pytest-html?",
        "pytest --html=report.html", "pytest --report=html", "pytest --output=report.html", "pytest --generate-html",
        "A", "The --html flag specifies the output file for the HTML report.")

    add(SUBJECT, "Reporting", "Easy", "mcq",
        "Which reporting framework provides detailed, interactive test reports with Selenium?",
        "Allure", "JUnit only", "TextReport", "HTMLSimple",
        "A", "Allure framework generates rich, interactive test reports with attachments and history.")

    add(SUBJECT, "Reporting", "Medium", "mcq",
        "How do you attach a screenshot to an Allure report?",
        "allure.attach(screenshot_bytes, name='screenshot', attachment_type=allure.attachment_type.PNG)",
        "allure.screenshot(driver)", "allure.add_image(screenshot)", "allure.embed(screenshot, 'png')",
        "A", "allure.attach with PNG attachment type embeds screenshot bytes in the report.")

    add(SUBJECT, "Reporting", "Medium", "mcq",
        "Which command generates the Allure report from test results?",
        "allure serve ./allure-results", "allure generate report.html", "allure create ./results", "allure build report",
        "A", "allure serve opens a local server displaying the report from the results directory.")

    add(SUBJECT, "Reporting", "Medium", "mcq",
        "How do you add custom metadata to a pytest-html report?",
        "Use pytest_configure hook to add to config._metadata", "Edit the HTML file directly", "Use a config.ini file", "Pass metadata via command line",
        "A", "The pytest_configure hook with config._metadata adds environment info to the HTML report.")

    add(SUBJECT, "Reporting", "Medium", "mcq",
        "What is the JUnit XML report format used for?",
        "CI/CD integration - most CI tools (Jenkins, GitLab CI) can parse JUnit XML",
        "Browser testing only", "Database reports", "Code coverage",
        "A", "JUnit XML is a standard format understood by most CI/CD tools for test result visualization.")

    add(SUBJECT, "Reporting", "Hard", "mcq",
        "How do you generate JUnit XML reports with pytest?",
        "pytest --junitxml=results.xml", "pytest --xml=results.xml", "pytest --junit=results.xml", "pytest --report-format=junit",
        "A", "--junitxml flag generates a JUnit XML report file compatible with CI tools.")

    add(SUBJECT, "Reporting", "Hard", "mcq",
        "How do you embed screenshots in pytest-html reports on test failure?",
        "Use pytest_runtest_makereport hook to add base64 screenshot as extras",
        "Screenshots are embedded automatically", "Use pytest.screenshot() function", "Add screenshots to conftest only",
        "A", "The makereport hook allows adding extra content (like base64 screenshots) to the HTML report.")

    add(SUBJECT, "Reporting", "Hard", "mcq",
        "What is the purpose of Allure decorators like @allure.step?",
        "To break test actions into reportable steps with descriptions",
        "To slow down test execution", "To add assertions", "To parametrize tests",
        "A", "@allure.step decorates functions to create meaningful step-by-step test documentation in reports.")

    add(SUBJECT, "Reporting", "Hard", "mcq",
        "How can you add real-time test execution logging to Selenium test reports?",
        "Use Python logging module integrated with the reporting framework and attach logs to report",
        "Print statements are sufficient", "Use driver.log() method", "Real-time logging is not possible",
        "A", "Python's logging module captures execution details that can be attached to test reports.")

    # Output (5)
    add(SUBJECT, "Reporting", "Easy", "output",
        "What does this command produce?",
        "An HTML file named report.html containing test results",
        "A text file", "A PDF report", "Console output only",
        "A", "--html=report.html generates an HTML test report.",
        "# Command: pytest --html=report.html tests/\nprint('HTML report generated')")

    add(SUBJECT, "Reporting", "Medium", "output",
        "What does this Allure step decorator create in the report?",
        "A labeled step 'Enter credentials' showing the action details",
        "A new test case", "A test fixture", "A log entry only",
        "A", "@allure.step creates a named step in the Allure report with parameter details.",
        "import allure\n\n@allure.step('Enter credentials: {username}')\ndef enter_credentials(driver, username, password):\n    driver.find_element(By.ID, 'user').send_keys(username)\n    driver.find_element(By.ID, 'pass').send_keys(password)\nprint('Allure step defined')")

    add(SUBJECT, "Reporting", "Medium", "output",
        "What does this code add to the report?",
        "Custom environment metadata showing Browser and OS information",
        "Test case descriptions", "Code coverage data", "Execution time",
        "A", "config._metadata additions appear in the Environment section of pytest-html reports.",
        "def pytest_configure(config):\n    config._metadata['Browser'] = 'Chrome 120'\n    config._metadata['OS'] = 'Windows 11'\nprint('Metadata configured')")

    add(SUBJECT, "Reporting", "Hard", "output",
        "What does this hook implementation do?",
        "Captures a screenshot on test failure and embeds it as base64 in the HTML report",
        "Takes a screenshot before every test", "Logs test names", "Creates a video recording",
        "A", "The hook checks for failures and adds a base64 screenshot extra to the HTML report.",
        "@pytest.hookimpl(hookwrapper=True)\ndef pytest_runtest_makereport(item, call):\n    outcome = yield\n    report = outcome.get_result()\n    if report.when == 'call' and report.failed:\n        driver = item.funcargs.get('driver')\n        if driver:\n            img = driver.get_screenshot_as_base64()\n            extra = [{'name': 'Screenshot', 'content': img, 'mime_type': 'image/png'}]\nprint('Failure screenshot hook defined')")

    add(SUBJECT, "Reporting", "Hard", "output",
        "What does this Allure severity marker indicate?",
        "Marks the test as critical severity in the Allure report for prioritization",
        "Makes the test run first", "Fails the test if it takes too long", "Sets test timeout",
        "A", "Allure severity markers categorize tests by importance in the report dashboard.",
        "import allure\n\n@allure.severity(allure.severity_level.CRITICAL)\ndef test_checkout_flow(driver):\n    pass\nprint('Critical test marked')")

    # Scenario (5)
    add(SUBJECT, "Reporting", "Easy", "scenario",
        "Your team wants to see test results in their CI/CD pipeline (Jenkins). Which report format is most suitable?",
        "JUnit XML (--junitxml=results.xml)", "HTML report", "Plain text", "Allure only",
        "A", "JUnit XML is the standard format that Jenkins and most CI tools natively support.")

    add(SUBJECT, "Reporting", "Medium", "scenario",
        "Stakeholders want detailed visual test reports with screenshots showing each test step. Which tool is best?",
        "Allure framework with @allure.step decorators and screenshot attachments",
        "pytest-html only", "JUnit XML", "Console output",
        "A", "Allure provides step-by-step reports with attachments, ideal for detailed stakeholder-facing reports.")

    add(SUBJECT, "Reporting", "Medium", "scenario",
        "You need to track test execution trends over multiple runs. Which reporting approach supports this?",
        "Allure with history retention, or CI tool dashboards with JUnit XML trend analysis",
        "Single HTML reports", "Log files", "Email notifications",
        "A", "Allure history and CI tool trend analysis provide execution trend visualization over time.")

    add(SUBJECT, "Reporting", "Hard", "scenario",
        "Your report needs to include browser console errors captured during test execution. How do you implement this?",
        "Capture browser logs via driver.get_log('browser') and attach them to the report in teardown",
        "Console errors are captured automatically", "Use JavaScript to log errors",
        "Monitor the network tab manually",
        "A", "Browser logs captured via the driver can be attached to reports for debugging.")

    add(SUBJECT, "Reporting", "Hard", "scenario",
        "You need a reporting solution that integrates with both pytest and provides a real-time dashboard. What do you recommend?",
        "Allure with a report server, or ReportPortal for real-time dashboards and analytics",
        "pytest-html only", "Custom dashboard from scratch", "Console output piped to a web app",
        "A", "ReportPortal provides real-time test execution dashboards, while Allure offers detailed post-execution reports.")

    # Code Completion (5)
    add(SUBJECT, "Reporting", "Easy", "code_completion",
        "Complete the command to generate an HTML report.",
        "pytest --html=report.html --self-contained-html",
        "pytest --report=html --output=report.html",
        "pytest --generate-report=html",
        "pytest --html-output report.html",
        "A", "--html and --self-contained-html create a single HTML file with all assets embedded.",
        "# Command: ___")

    add(SUBJECT, "Reporting", "Medium", "code_completion",
        "Complete the code to attach a screenshot to an Allure report.",
        "allure.attach(driver.get_screenshot_as_png(), name='Page Screenshot', attachment_type=allure.attachment_type.PNG)",
        "allure.screenshot(driver, 'Page Screenshot')",
        "allure.add_screenshot(driver)",
        "allure.embed(driver.screenshot(), 'screenshot')",
        "A", "allure.attach with PNG type embeds the screenshot in the Allure report.",
        "import allure\n___")

    add(SUBJECT, "Reporting", "Medium", "code_completion",
        "Complete the Allure step decorator.",
        "@allure.step('Click login button')",
        "@allure.action('Click login button')",
        "@allure.log('Click login button')",
        "@step('Click login button')",
        "A", "@allure.step creates a labeled step in the Allure test report.",
        "import allure\n___\ndef click_login(driver):\n    driver.find_element(By.ID, 'login').click()")

    add(SUBJECT, "Reporting", "Hard", "code_completion",
        "Complete the pytest hook to embed screenshots on failure in HTML reports.",
        "pytest_html.extras.image(driver.get_screenshot_as_base64(), 'Screenshot')",
        "pytest.screenshot(driver)",
        "extras.add_screenshot(driver)",
        "html_report.attach(driver.screenshot())",
        "A", "pytest_html extras with base64 image embed failure screenshots in the report.",
        "from pytest_html import extras as html_extras\n@pytest.hookimpl(hookwrapper=True)\ndef pytest_runtest_makereport(item, call):\n    outcome = yield\n    report = outcome.get_result()\n    if report.when == 'call' and report.failed:\n        driver = item.funcargs.get('driver')\n        if driver:\n            report.extras = [___]")

    add(SUBJECT, "Reporting", "Hard", "code_completion",
        "Complete the code to generate both HTML and JUnit XML reports.",
        "pytest --html=report.html --self-contained-html --junitxml=results.xml tests/",
        "pytest --html=report.html --xml=results.xml tests/",
        "pytest --reports=html,junit tests/",
        "pytest --multi-report=html,xml tests/",
        "A", "Both --html and --junitxml flags can be used together to generate multiple report formats.",
        "# Command: ___")

    # ===================== ADDITIONAL QUESTIONS TO REACH 500 =====================
    # Output +1 (Easy)
    add(SUBJECT, "Locators", "Easy", "output",
        "What does this code print for a page with an element <input type='text' name='search'>?",
        "text", "search", "input", "None",
        "A", "get_attribute('type') returns the value of the type attribute of the element.",
        "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\ndriver = webdriver.Chrome()\ndriver.get('https://example.com')\nelem = driver.find_element(By.NAME, 'search')\nprint(elem.get_attribute('type'))\ndriver.quit()")

    # Scenario +2 (Easy)
    add(SUBJECT, "Waits", "Easy", "scenario",
        "You want to pause your test for exactly 3 seconds regardless of page state. Why is time.sleep(3) generally discouraged?",
        "It wastes time if the condition is met earlier and is unreliable if the condition needs longer",
        "It does not work in Python", "It pauses only the browser, not the script",
        "It is deprecated in Python 3",
        "A", "Hard-coded sleeps are inefficient and brittle; explicit waits are preferred for condition-based waiting.")

    add(SUBJECT, "Actions", "Easy", "scenario",
        "You need to type text into a search box and press Enter. Which approach is simplest?",
        "element.send_keys('search term', Keys.ENTER)", "ActionChains(driver).type('search term').enter()",
        "driver.type('search term').press_enter()", "element.input('search term').submit()",
        "A", "send_keys with Keys.ENTER types the text and submits in one call without needing ActionChains.")

    # Code Completion +7 (mix Easy/Medium)
    add(SUBJECT, "Locators", "Easy", "code_completion",
        "Complete the code to find all links on a page.",
        "driver.find_elements(By.TAG_NAME, 'a')",
        "driver.find_all(By.LINK, '*')",
        "driver.get_links()",
        "driver.find_elements(By.LINK_TEXT, '*')",
        "A", "find_elements with By.TAG_NAME 'a' returns all anchor elements on the page.",
        "from selenium.webdriver.common.by import By\nlinks = ___\nprint(f'Found {len(links)} links')")

    add(SUBJECT, "Waits", "Easy", "code_completion",
        "Complete the code to set an implicit wait of 5 seconds.",
        "driver.implicitly_wait(5)",
        "driver.set_wait(5)",
        "driver.wait_time = 5",
        "WebDriverWait(driver, 5)",
        "A", "implicitly_wait sets the default wait time for all find_element calls.",
        "from selenium import webdriver\ndriver = webdriver.Chrome()\n___")

    add(SUBJECT, "Windows", "Easy", "code_completion",
        "Complete the code to get the current window handle.",
        "driver.current_window_handle",
        "driver.window_handle()",
        "driver.get_handle()",
        "driver.active_window()",
        "A", "current_window_handle returns the handle string for the focused window.",
        "main_window = ___\nprint(f'Main window: {main_window}')")

    add(SUBJECT, "Alerts", "Easy", "code_completion",
        "Complete the code to dismiss a confirm dialog.",
        "driver.switch_to.alert; alert.dismiss()",
        "driver.get_alert(); alert.cancel()",
        "driver.alert(); alert.no()",
        "driver.dismiss_alert()",
        "A", "switch_to.alert gets the Alert object and dismiss() clicks Cancel.",
        "alert = ___\n___")

    add(SUBJECT, "Select", "Easy", "code_completion",
        "Complete the code to create a Select object from a dropdown element.",
        "Select(driver.find_element(By.ID, 'country'))",
        "Dropdown(driver.find_element(By.ID, 'country'))",
        "driver.select(By.ID, 'country')",
        "SelectElement(By.ID, 'country')",
        "A", "Select wraps a WebElement representing a <select> tag.",
        "from selenium.webdriver.support.select import Select\nfrom selenium.webdriver.common.by import By\nselect = ___")

    add(SUBJECT, "Frames", "Medium", "code_completion",
        "Complete the code to switch back to the main document from any nested frame.",
        "driver.switch_to.default_content()",
        "driver.switch_to.main()",
        "driver.exit_all_frames()",
        "driver.switch_to.top()",
        "A", "default_content() returns the driver context to the top-level document regardless of nesting depth.",
        "# Currently inside a nested frame\n___\n# Now back at the main page")

    add(SUBJECT, "Screenshots", "Medium", "code_completion",
        "Complete the code to save a screenshot with a timestamp filename.",
        "driver.save_screenshot(f'screenshot_{timestamp}.png')",
        "driver.capture(f'screenshot_{timestamp}.png')",
        "driver.screenshot(timestamp)",
        "driver.save_image(f'{timestamp}.png')",
        "A", "save_screenshot with an f-string timestamp creates unique screenshot filenames.",
        "from datetime import datetime\ntimestamp = datetime.now().strftime('%Y%m%d_%H%M%S')\n___")

    return questions


def main():
    questions = build_questions()

    # Count types and difficulties
    type_counts = {}
    diff_counts = {}

    for q in questions:
        t = q["type"]
        d = q["difficulty"]
        type_counts[t] = type_counts.get(t, 0) + 1
        diff_counts[d] = diff_counts.get(d, 0) + 1

    print(f"Total questions: {len(questions)}")
    print(f"Type counts: {type_counts}")
    print(f"Difficulty counts: {diff_counts}")

    # Validate constraints
    for q in questions:
        if q["type"] in ("mcq", "scenario"):
            assert q["code_snippet"] == "", f"Q{q['id']}: MCQ/scenario should have empty code_snippet"
        if q["type"] == "output":
            assert q["code_snippet"] != "", f"Q{q['id']}: Output question must have code_snippet"
        if q["type"] == "code_completion":
            assert "___" in q["code_snippet"], f"Q{q['id']}: Code completion must have ___ blank"
        assert q["correct_answer"] in ("A", "B", "C", "D"), f"Q{q['id']}: Invalid correct_answer"

    df = pd.DataFrame(questions)

    # Ensure column order
    columns = [
        "id", "subject", "topic", "difficulty", "type", "question",
        "option_a", "option_b", "option_c", "option_d",
        "correct_answer", "explanation", "code_snippet"
    ]
    df = df[columns]

    output_path = r"D:\HackerRankSimulation\question_bank\python_selenium_questions.csv"
    df.to_csv(output_path, index=False, quoting=csv.QUOTE_ALL)

    # Verify
    verify_df = pd.read_csv(output_path)
    print(f"\nCSV row count: {len(verify_df)}")
    print(f"\nType breakdown:\n{verify_df['type'].value_counts().to_string()}")
    print(f"\nDifficulty breakdown:\n{verify_df['difficulty'].value_counts().to_string()}")


if __name__ == "__main__":
    main()
