const problems = [
  // ============================================================
  // SECTION 1: Core Java (5 problems)
  // ============================================================
  {
    id: 1,
    title: "Reverse Words in a String",
    section: "Core Java",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Given a sentence as a single line of input, reverse the order of words and print the result.\n\nWords are separated by single spaces. The output should not have leading or trailing spaces.",
    inputFormat: "A single line containing words separated by spaces.",
    outputFormat: "A single line with the words in reversed order.",
    constraints: "1 <= number of words <= 100\nEach word length <= 50\nInput contains only lowercase/uppercase letters and spaces.",
    sampleTestCases: [
      { input: "Hello World Java", expectedOutput: "Java World Hello", explanation: "The three words are reversed in order." },
      { input: "I love coding", expectedOutput: "coding love I", explanation: "Three words reversed." }
    ],
    hiddenTestCases: [
      { input: "Hello World Java", expectedOutput: "Java World Hello" },
      { input: "SingleWord", expectedOutput: "SingleWord" },
      { input: "a b c d e", expectedOutput: "e d c b a" },
      { input: "The quick brown fox", expectedOutput: "fox brown quick The" },
      { input: "OpenAI is great", expectedOutput: "great is OpenAI" }
    ],
    starterCode: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        // Write your code here

    }
}`,
    solution: `import java.util.Scanner;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        String[] words = line.split(" ");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(" ");
        }
        System.out.println(sb.toString());
    }
}`,
    evaluationType: "output"
  },
  {
    id: 2,
    title: "Find Duplicates in Array",
    section: "Core Java",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Given n integers, find and print all duplicate values in the order of their first repeated occurrence.\n\nA number is a duplicate if it appears more than once. Print each duplicate only once, in the order it first becomes a duplicate.",
    inputFormat: "First line: integer n (number of elements)\nSecond line: n space-separated integers",
    outputFormat: "Each duplicate on a new line, in order of first repeated occurrence.\nIf no duplicates, print \"No duplicates\".",
    constraints: "1 <= n <= 10000\n-10^6 <= each integer <= 10^6",
    sampleTestCases: [
      { input: "5\n1 2 3 2 1", expectedOutput: "2\n1", explanation: "2 is seen again at index 3 (first duplicate), 1 at index 4." },
      { input: "4\n5 6 7 8", expectedOutput: "No duplicates", explanation: "All elements are unique." }
    ],
    hiddenTestCases: [
      { input: "5\n1 2 3 2 1", expectedOutput: "2\n1" },
      { input: "4\n5 6 7 8", expectedOutput: "No duplicates" },
      { input: "6\n1 1 2 2 3 3", expectedOutput: "1\n2\n3" },
      { input: "1\n42", expectedOutput: "No duplicates" },
      { input: "8\n3 5 3 7 5 9 7 3", expectedOutput: "3\n5\n7" }
    ],
    starterCode: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        String[] parts = sc.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        // Write your code here

    }
}`,
    solution: `import java.util.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        String[] parts = sc.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        Set<Integer> seen = new LinkedHashSet<>();
        Set<Integer> dups = new LinkedHashSet<>();
        for (int x : arr) { if (!seen.add(x)) dups.add(x); }
        if (dups.isEmpty()) System.out.println("No duplicates");
        else dups.forEach(System.out::println);
    }
}`,
    evaluationType: "output"
  },
  {
    id: 3,
    title: "Group Anagrams",
    section: "Core Java",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Given a list of words, group all anagrams together.\n\nTwo words are anagrams if they contain the same characters with the same frequencies.\n\nPrint each group on a separate line with words sorted alphabetically within the group. Groups should be sorted by their first word alphabetically.",
    inputFormat: "A single line of space-separated words (all lowercase).",
    outputFormat: "Each group of anagrams on a separate line, words separated by spaces, sorted within group and groups sorted by first word.",
    constraints: "1 <= number of words <= 100\nEach word length <= 20\nAll lowercase English letters.",
    sampleTestCases: [
      { input: "eat tea tan ate nat bat", expectedOutput: "ate eat tea\nbat\nnat tan", explanation: "ate/eat/tea are anagrams, bat is alone, nat/tan are anagrams." }
    ],
    hiddenTestCases: [
      { input: "eat tea tan ate nat bat", expectedOutput: "ate eat tea\nbat\nnat tan" },
      { input: "hello world", expectedOutput: "hello\nworld" },
      { input: "abc bca cab xyz zyx", expectedOutput: "abc bca cab\nxyz zyx" },
      { input: "a", expectedOutput: "a" },
      { input: "listen silent enlist dog god", expectedOutput: "dog god\nenlist listen silent" }
    ],
    starterCode: `import java.util.*;
import java.util.stream.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] words = sc.nextLine().trim().split(" ");
        // Write your code here

    }
}`,
    solution: `import java.util.*;
import java.util.stream.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] words = sc.nextLine().trim().split(" ");
        Map<String, List<String>> groups = new TreeMap<>();
        for (String w : words) {
            char[] c = w.toCharArray(); Arrays.sort(c);
            String key = new String(c);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
        }
        for (List<String> g : groups.values()) {
            Collections.sort(g);
            System.out.println(String.join(" ", g));
        }
    }
}`,
    evaluationType: "output"
  },
  {
    id: 4,
    title: "Employee Salary Stream",
    section: "Core Java",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Given N employees as CSV lines (name,department,salary), use Java Streams to:\n1. Print the average salary per department (sorted alphabetically by department name), formatted to 2 decimal places.\n2. Print the name of the highest-paid employee.\n\nOutput format:\ndeptName: avgSalary\n...\nHIGHEST: employeeName",
    inputFormat: "First line: integer N\nNext N lines: name,department,salary",
    outputFormat: "One line per department: \"dept: avg\" (avg to 2 decimal places)\nLast line: \"HIGHEST: name\"",
    constraints: "1 <= N <= 100\nSalary is a positive integer.",
    sampleTestCases: [
      {
        input: "4\nAlice,Engineering,80000\nBob,Engineering,90000\nCharlie,Sales,50000\nDave,Sales,60000",
        expectedOutput: "Engineering: 85000.00\nSales: 55000.00\nHIGHEST: Bob",
        explanation: "Engineering avg = (80000+90000)/2 = 85000.00. Sales avg = 55000.00. Bob earns the most."
      }
    ],
    hiddenTestCases: [
      { input: "4\nAlice,Engineering,80000\nBob,Engineering,90000\nCharlie,Sales,50000\nDave,Sales,60000", expectedOutput: "Engineering: 85000.00\nSales: 55000.00\nHIGHEST: Bob" },
      { input: "1\nJohn,IT,70000", expectedOutput: "IT: 70000.00\nHIGHEST: John" },
      { input: "3\nA,HR,40000\nB,HR,50000\nC,HR,60000", expectedOutput: "HR: 50000.00\nHIGHEST: C" },
      { input: "5\nA,X,10000\nB,Y,20000\nC,X,30000\nD,Y,40000\nE,Z,25000", expectedOutput: "X: 20000.00\nY: 30000.00\nZ: 25000.00\nHIGHEST: D" },
      { input: "2\nAlice,Dev,100000\nBob,QA,100000", expectedOutput: "Dev: 100000.00\nQA: 100000.00\nHIGHEST: Alice" }
    ],
    starterCode: `import java.util.*;
import java.util.stream.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        List<String[]> employees = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            employees.add(sc.nextLine().trim().split(","));
        }
        // employees[i] = [name, department, salary]
        // Write your code using Java Streams

    }
}`,
    solution: `import java.util.*;
import java.util.stream.*;
public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = Integer.parseInt(sc.nextLine().trim());
        List<String[]> emps = new ArrayList<>();
        for (int i = 0; i < n; i++) emps.add(sc.nextLine().trim().split(","));
        TreeMap<String, Double> avgs = emps.stream()
            .collect(Collectors.groupingBy(e -> e[1], TreeMap::new, Collectors.averagingInt(e -> Integer.parseInt(e[2]))));
        avgs.forEach((d, a) -> System.out.printf("%s: %.2f%n", d, a));
        String highest = emps.stream().max(Comparator.comparingInt(e -> Integer.parseInt(e[2]))).get()[0];
        System.out.println("HIGHEST: " + highest);
    }
}`,
    evaluationType: "output"
  },

  // ============================================================
  // SECTION 2: Selenium WebDriver (5 problems) — keyword evaluation
  // ============================================================
  {
    id: 6,
    title: "Write Page Object Class",
    section: "Selenium WebDriver",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Write a complete Page Object Model class for a Login page with the following elements:\n- Username field: id=\"username\"\n- Password field: id=\"password\"\n- Login button: id=\"loginBtn\"\n\nYour class must:\n1. Be named `LoginPage`\n2. Have a WebDriver field\n3. Accept WebDriver in the constructor\n4. Use `@FindBy` annotations for each element\n5. Call `PageFactory.initElements()` in the constructor\n6. Have methods: `enterUsername(String)`, `enterPassword(String)`, `clickLogin()`",
    inputFormat: "N/A — This is a code-writing problem.",
    outputFormat: "N/A — Your code will be evaluated for correctness of structure.",
    constraints: "Must use Selenium WebDriver PageFactory pattern.\nMust include all required annotations and methods.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Your code must contain @FindBy, PageFactory.initElements, WebDriver constructor, and all three methods." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {
    // Write your Page Object class here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["@FindBy", "PageFactory.initElements", "WebDriver", "enterUsername", "enterPassword", "clickLogin", "username", "password", "loginBtn"],
    requiredCount: 7
  },
  {
    id: 7,
    title: "Implement Explicit Wait",
    section: "Selenium WebDriver",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Write a utility method with this signature:\n\n```java\npublic static WebElement waitForElementClickable(WebDriver driver, By locator, int timeoutSeconds)\n```\n\nThe method should:\n1. Create a WebDriverWait with the given timeout\n2. Wait until the element located by `locator` is clickable\n3. Return the clickable WebElement\n4. Use `ExpectedConditions.elementToBeClickable()`",
    inputFormat: "N/A — Code-writing problem.",
    outputFormat: "N/A — Code structure evaluated.",
    constraints: "Must use WebDriverWait and ExpectedConditions.\nMust use Duration.ofSeconds() (Selenium 4 style).",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must contain WebDriverWait, ExpectedConditions.elementToBeClickable, Duration or timeoutSeconds." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;

public class WaitUtils {
    // Write your method here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["WebDriverWait", "ExpectedConditions", "elementToBeClickable", "Duration", "until", "WebElement"],
    requiredCount: 5
  },
  {
    id: 8,
    title: "Handle Dynamic Dropdown",
    section: "Selenium WebDriver",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Write a method to handle BOTH types of dropdowns:\n\n1. **Standard HTML `<select>` dropdown** — use Selenium's `Select` class\n2. **Dynamic dropdown** (ul/li based) — click to open, wait, then click option\n\nMethod signature:\n```java\npublic static void selectOption(WebDriver driver, String dropdownId, String optionText)\n```\n\nYour method should:\n- First try to use the `Select` class (for standard dropdowns)\n- If that fails (the element is not a `<select>`), fall back to clicking the dropdown element, waiting for options to appear, and clicking the matching option\n- Use explicit waits where appropriate",
    inputFormat: "N/A",
    outputFormat: "N/A",
    constraints: "Must handle both dropdown types.\nMust use WebDriverWait for dynamic dropdown.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must show knowledge of Select class and dynamic dropdown handling." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;

public class DropdownUtils {
    public static void selectOption(WebDriver driver, String dropdownId, String optionText) {
        // Write your code here — handle both <select> and dynamic dropdowns

    }
}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["Select", "selectByVisibleText", "WebDriverWait", "click", "findElement", "ExpectedConditions"],
    requiredCount: 4
  },
  {
    id: 9,
    title: "Data Driven Test with TestNG",
    section: "Selenium WebDriver",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Write a complete TestNG test class for login functionality that:\n\n1. Has a `@DataProvider` method named `loginData` returning 3 sets of credentials:\n   - (\"admin\", \"admin123\", true)\n   - (\"user1\", \"pass1\", true)\n   - (\"invalid\", \"wrong\", false)\n2. Has a `@Test` method `testLogin` that uses the data provider\n3. For valid credentials: asserts page title contains \"Dashboard\"\n4. For invalid credentials: asserts error message element is displayed\n5. Uses `Assert.assertEquals` or `Assert.assertTrue`",
    inputFormat: "N/A",
    outputFormat: "N/A",
    constraints: "Must use TestNG annotations.\nMust have exactly 3 data rows.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must contain @DataProvider, @Test, data provider linkage, and assertions." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import org.testng.annotations.*;
import org.testng.Assert;
import org.openqa.selenium.WebDriver;

public class LoginTest {
    // Write your data-driven test class here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["@DataProvider", "@Test", "dataProvider", "Assert", "admin", "loginData", "Object[][]"],
    requiredCount: 5
  },

  // ============================================================
  // SECTION 3: REST API Testing with RestAssured (5 problems) — keyword evaluation
  // ============================================================
  {
    id: 11,
    title: "Write GET Request Test",
    section: "RestAssured & API Testing",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Write a RestAssured test method that:\n1. Sends a GET request to `https://jsonplaceholder.typicode.com/posts/1`\n2. Asserts the status code is 200\n3. Asserts the response body field `userId` equals 1\n4. Asserts the `title` field is not empty\n\nUse RestAssured's BDD-style `given().when().then()` syntax.",
    inputFormat: "N/A",
    outputFormat: "N/A",
    constraints: "Must use RestAssured given/when/then pattern.\nMust validate status code and body fields.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must contain given(), when(), then(), statusCode(200), body assertions." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import io.restassured.RestAssured;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

public class GetTest {
    // Write your GET request test here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["given()", "get(", "statusCode(200)", "body(", "equalTo", "posts/1"],
    requiredCount: 4
  },
  {
    id: 12,
    title: "Write POST Request Test",
    section: "RestAssured & API Testing",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Write a RestAssured test to:\n1. Send a POST request to `/api/users`\n2. Set Content-Type to JSON\n3. Send body: `{\"name\": \"John\", \"job\": \"tester\"}`\n4. Assert status code 201\n5. Assert response body contains an `id` field that is not null",
    inputFormat: "N/A",
    outputFormat: "N/A",
    constraints: "Must set Content-Type header.\nMust send JSON body.\nMust verify 201 and response fields.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must contain contentType(JSON), body(), post(), statusCode(201), notNullValue()." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import io.restassured.RestAssured;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import io.restassured.http.ContentType;

public class PostTest {
    // Write your POST request test here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["contentType", "body(", "post(", "statusCode(201)", "notNullValue", "JSON"],
    requiredCount: 4
  },
  {
    id: 13,
    title: "Extract and Chain API Calls",
    section: "RestAssured & API Testing",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Write a test that chains two API calls:\n\n1. **Step 1**: POST to `/api/users` with body `{\"name\":\"TestUser\",\"job\":\"QA\"}`. Extract the `id` from the response.\n2. **Step 2**: Use the extracted `id` to send a GET request to `/api/users/{id}`.\n3. Assert the GET response has status 200 and the `name` field matches \"TestUser\".\n\nUse `extract().path()` or `extract().jsonPath()` to capture the id.",
    inputFormat: "N/A",
    outputFormat: "N/A",
    constraints: "Must chain two API calls.\nMust extract value from first response and use in second.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must show POST → extract id → GET with id → assert." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import io.restassured.RestAssured;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import io.restassured.http.ContentType;

public class ChainedTest {
    // Write your chained API test here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["post(", "get(", "extract()", "path(", "statusCode", "body(", "name"],
    requiredCount: 5
  },
  {
    id: 14,
    title: "Write Full CRUD Test Suite",
    section: "RestAssured & API Testing",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Write a TestNG test class with a complete CRUD test suite for a `/api/todos` endpoint:\n\n1. `@BeforeClass`: Set `RestAssured.baseURI`\n2. `testCreate()`: POST → assert 201\n3. `testRead()`: GET → assert 200, verify fields\n4. `testUpdate()`: PUT → assert 200, verify updated field\n5. `testDelete()`: DELETE → assert 200 or 204\n\nUse `@Test(priority=...)` to order the tests.",
    inputFormat: "N/A",
    outputFormat: "N/A",
    constraints: "Must have 4 test methods covering POST, GET, PUT, DELETE.\nMust include @BeforeClass for base URI setup.",
    sampleTestCases: [
      { input: "", expectedOutput: "Code structure evaluated", explanation: "Must contain all 4 HTTP methods, proper annotations, and assertions." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" },
      { input: "", expectedOutput: "PASS" }
    ],
    starterCode: `import io.restassured.RestAssured;
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import io.restassured.http.ContentType;
import org.testng.annotations.*;

public class CrudTest {
    // Write your CRUD test suite here

}`,
    solution: "",
    evaluationType: "keyword",
    requiredKeywords: ["@BeforeClass", "baseURI", "post(", "get(", "put(", "delete(", "statusCode", "@Test"],
    requiredCount: 6
  },

  // ============================================================
  // SECTION 4: SQL (5 problems) — executed via SQLite
  // ============================================================
  {
    id: 16,
    title: "Find Employees by Department",
    section: "SQL",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Given an `employees` table, write a SQL query to find all employees in the **Engineering** department who earn more than **50000**, ordered by salary descending.\n\n**Table: employees**\n| Column | Type |\n|---|---|\n| id | INTEGER |\n| name | TEXT |\n| department | TEXT |\n| salary | INTEGER |\n| hire_date | TEXT |",
    inputFormat: "No input required — write only the SQL SELECT statement.",
    outputFormat: "name|salary (one row per line, pipe-separated)",
    constraints: "Use a single SELECT statement.\nDo not use semicolons at the end.",
    sampleTestCases: [
      { input: "", expectedOutput: "Bob|90000\nAlice|80000\nHenry|72000", explanation: "Bob, Alice, and Henry are in Engineering with salary > 50000, ordered by salary DESC." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "Bob|90000\nAlice|80000\nHenry|72000" },
      { input: "", expectedOutput: "Bob|90000\nAlice|80000\nHenry|72000" },
      { input: "", expectedOutput: "Bob|90000\nAlice|80000\nHenry|72000" },
      { input: "", expectedOutput: "Bob|90000\nAlice|80000\nHenry|72000" },
      { input: "", expectedOutput: "Bob|90000\nAlice|80000\nHenry|72000" }
    ],
    starterCode: `-- Write your SQL query below
SELECT `,
    solution: "SELECT name, salary FROM employees WHERE department = 'Engineering' AND salary > 50000 ORDER BY salary DESC",
    evaluationType: "sql",
    sqlSetup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER, hire_date TEXT);
INSERT INTO employees VALUES (1,'Alice','Engineering',80000,'2020-01-15');
INSERT INTO employees VALUES (2,'Bob','Engineering',90000,'2019-06-01');
INSERT INTO employees VALUES (3,'Charlie','Sales',50000,'2021-03-10');
INSERT INTO employees VALUES (4,'Dave','Sales',60000,'2020-11-20');
INSERT INTO employees VALUES (5,'Eve','Engineering',45000,'2022-01-05');
INSERT INTO employees VALUES (6,'Frank','HR',55000,'2020-07-15');
INSERT INTO employees VALUES (7,'Grace','HR',65000,'2019-09-01');
INSERT INTO employees VALUES (8,'Henry','Engineering',72000,'2021-06-15');`
  },
  {
    id: 17,
    title: "Count by Category",
    section: "SQL",
    difficulty: "Easy",
    points: 10,
    timeLimit: 5000,
    description: "Given an `orders` table, write a SQL query to count orders per category and calculate the total amount. Order the results by order count descending.\n\n**Table: orders**\n| Column | Type |\n|---|---|\n| id | INTEGER |\n| customer_id | INTEGER |\n| product | TEXT |\n| category | TEXT |\n| amount | INTEGER |\n| order_date | TEXT |",
    inputFormat: "No input — write the SQL query only.",
    outputFormat: "category|count|total_amount (pipe-separated, one row per line)",
    constraints: "Use GROUP BY and ORDER BY.\nUse COUNT(*) and SUM(amount).",
    sampleTestCases: [
      { input: "", expectedOutput: "Electronics|4|3400\nClothing|3|450\nBooks|2|90\nFood|1|30", explanation: "Grouped by category, counted and summed, ordered by count DESC." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "Electronics|4|3400\nClothing|3|450\nBooks|2|90\nFood|1|30" },
      { input: "", expectedOutput: "Electronics|4|3400\nClothing|3|450\nBooks|2|90\nFood|1|30" },
      { input: "", expectedOutput: "Electronics|4|3400\nClothing|3|450\nBooks|2|90\nFood|1|30" },
      { input: "", expectedOutput: "Electronics|4|3400\nClothing|3|450\nBooks|2|90\nFood|1|30" },
      { input: "", expectedOutput: "Electronics|4|3400\nClothing|3|450\nBooks|2|90\nFood|1|30" }
    ],
    starterCode: `-- Write your SQL query below
SELECT `,
    solution: "SELECT category, COUNT(*) as cnt, SUM(amount) as total FROM orders GROUP BY category ORDER BY cnt DESC",
    evaluationType: "sql",
    sqlSetup: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, product TEXT, category TEXT, amount INTEGER, order_date TEXT);
INSERT INTO orders VALUES (1,1,'Laptop','Electronics',1200,'2024-01-10');
INSERT INTO orders VALUES (2,2,'T-Shirt','Clothing',50,'2024-01-11');
INSERT INTO orders VALUES (3,1,'Phone','Electronics',800,'2024-01-12');
INSERT INTO orders VALUES (4,3,'Novel','Books',25,'2024-01-13');
INSERT INTO orders VALUES (5,2,'Jeans','Clothing',120,'2024-01-14');
INSERT INTO orders VALUES (6,4,'Tablet','Electronics',600,'2024-01-15');
INSERT INTO orders VALUES (7,3,'Cookbook','Books',65,'2024-01-16');
INSERT INTO orders VALUES (8,1,'Dress','Clothing',280,'2024-01-17');
INSERT INTO orders VALUES (9,5,'Headphones','Electronics',800,'2024-01-18');
INSERT INTO orders VALUES (10,4,'Bread','Food',30,'2024-01-19');`
  },
  {
    id: 18,
    title: "Second Highest Salary per Department",
    section: "SQL",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Find the second highest salary in each department. If a department has fewer than 2 employees, skip it.\n\n**Table: employees**\n| Column | Type |\n|---|---|\n| id | INTEGER |\n| name | TEXT |\n| department | TEXT |\n| salary | INTEGER |",
    inputFormat: "No input — write the SQL query.",
    outputFormat: "department|second_highest_salary (ordered by department alphabetically)",
    constraints: "Skip departments with only 1 employee.\nHandle duplicate salaries correctly.",
    sampleTestCases: [
      { input: "", expectedOutput: "Engineering|80000\nSales|50000", explanation: "Engineering: 90k, 80k, 72k → second = 80k. Sales: 60k, 50k → second = 50k. HR has only 1 distinct salary group so skipped if <2 people." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "Engineering|80000\nHR|55000\nSales|50000" },
      { input: "", expectedOutput: "Engineering|80000\nHR|55000\nSales|50000" },
      { input: "", expectedOutput: "Engineering|80000\nHR|55000\nSales|50000" },
      { input: "", expectedOutput: "Engineering|80000\nHR|55000\nSales|50000" },
      { input: "", expectedOutput: "Engineering|80000\nHR|55000\nSales|50000" }
    ],
    starterCode: `-- Write your SQL query below
-- Find second highest salary per department
SELECT `,
    solution: "SELECT department, salary as second_highest_salary FROM (SELECT department, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rk FROM employees) WHERE rk = 2 GROUP BY department ORDER BY department",
    evaluationType: "sql",
    sqlSetup: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice','Engineering',80000);
INSERT INTO employees VALUES (2,'Bob','Engineering',90000);
INSERT INTO employees VALUES (3,'Charlie','Sales',50000);
INSERT INTO employees VALUES (4,'Dave','Sales',60000);
INSERT INTO employees VALUES (5,'Eve','Engineering',72000);
INSERT INTO employees VALUES (6,'Frank','HR',55000);
INSERT INTO employees VALUES (7,'Grace','HR',65000);`
  },
  {
    id: 19,
    title: "Customer Order Analysis",
    section: "SQL",
    difficulty: "Medium",
    points: 20,
    timeLimit: 5000,
    description: "Find customers who have placed **more than 3 orders** AND have a **total order amount greater than 500**.\n\n**Tables:**\n- customers(id, name, city)\n- orders(id, customer_id, amount, order_date)\n\nShow: customer_name|order_count|total_amount ordered by total_amount DESC.",
    inputFormat: "No input — write the SQL query.",
    outputFormat: "customer_name|order_count|total_amount (pipe-separated)",
    constraints: "Use JOIN, GROUP BY, HAVING.\nFilter on both count and sum.",
    sampleTestCases: [
      { input: "", expectedOutput: "Alice|5|2800\nBob|4|1600", explanation: "Alice has 5 orders totaling 2800, Bob has 4 totaling 1600. Others have fewer orders or lower totals." }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "Alice|5|2800\nBob|4|1600" },
      { input: "", expectedOutput: "Alice|5|2800\nBob|4|1600" },
      { input: "", expectedOutput: "Alice|5|2800\nBob|4|1600" },
      { input: "", expectedOutput: "Alice|5|2800\nBob|4|1600" },
      { input: "", expectedOutput: "Alice|5|2800\nBob|4|1600" }
    ],
    starterCode: `-- Write your SQL query below
SELECT `,
    solution: "SELECT c.name, COUNT(o.id) as order_count, SUM(o.amount) as total_amount FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id HAVING COUNT(o.id) > 3 AND SUM(o.amount) > 500 ORDER BY total_amount DESC",
    evaluationType: "sql",
    sqlSetup: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO customers VALUES (1,'Alice','New York');
INSERT INTO customers VALUES (2,'Bob','Boston');
INSERT INTO customers VALUES (3,'Charlie','Chicago');
INSERT INTO customers VALUES (4,'Dave','Denver');
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER, order_date TEXT);
INSERT INTO orders VALUES (1,1,500,'2024-01-01');
INSERT INTO orders VALUES (2,1,600,'2024-01-05');
INSERT INTO orders VALUES (3,1,700,'2024-01-10');
INSERT INTO orders VALUES (4,1,500,'2024-01-15');
INSERT INTO orders VALUES (5,1,500,'2024-01-20');
INSERT INTO orders VALUES (6,2,400,'2024-01-02');
INSERT INTO orders VALUES (7,2,300,'2024-01-06');
INSERT INTO orders VALUES (8,2,500,'2024-01-11');
INSERT INTO orders VALUES (9,2,400,'2024-01-16');
INSERT INTO orders VALUES (10,3,200,'2024-01-03');
INSERT INTO orders VALUES (11,3,300,'2024-01-07');
INSERT INTO orders VALUES (12,4,100,'2024-01-04');`
  }
];

module.exports = problems;
