const pythonProblems = [
  {
    id: 101,
    title: "Reverse a String",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string, print it in reverse order.",
    inputFormat: "A single line containing a string s.",
    outputFormat: "Print the reversed string.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "hello", expectedOutput: "olleh", explanation: "The reverse of 'hello' is 'olleh'." },
      { input: "Python", expectedOutput: "nohtyP" }
    ],
    hiddenTestCases: [
      { input: "abcdef", expectedOutput: "fedcba" },
      { input: "a", expectedOutput: "a" },
      { input: "racecar", expectedOutput: "racecar" },
      { input: "12345", expectedOutput: "54321" },
      { input: "OpenAI", expectedOutput: "IAnepO" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nprint(s[::-1])`,
    evaluationType: "python"
  },
  {
    id: 102,
    title: "Sum of Array",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n numbers, find their sum.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the sum of the n integers.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "15", explanation: "1+2+3+4+5 = 15" },
      { input: "3\n10 20 30", expectedOutput: "60" }
    ],
    hiddenTestCases: [
      { input: "1\n42", expectedOutput: "42" },
      { input: "4\n-1 -2 -3 -4", expectedOutput: "-10" },
      { input: "6\n0 0 0 0 0 0", expectedOutput: "0" },
      { input: "3\n100 200 300", expectedOutput: "600" },
      { input: "2\n999999 1", expectedOutput: "1000000" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nprint(sum(nums))`,
    evaluationType: "python"
  },
  {
    id: 103,
    title: "Find Maximum",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n numbers, find the maximum value.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the maximum value.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5\n3 1 4 1 5", expectedOutput: "5", explanation: "The maximum value among 3, 1, 4, 1, 5 is 5." },
      { input: "3\n10 20 15", expectedOutput: "20" }
    ],
    hiddenTestCases: [
      { input: "1\n7", expectedOutput: "7" },
      { input: "4\n-5 -2 -8 -1", expectedOutput: "-1" },
      { input: "6\n100 200 300 400 500 600", expectedOutput: "600" },
      { input: "3\n0 0 0", expectedOutput: "0" },
      { input: "5\n-1000000 1000000 0 999999 -999999", expectedOutput: "1000000" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nprint(max(nums))`,
    evaluationType: "python"
  },
  {
    id: 104,
    title: "Count Vowels",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string, count the number of vowels (a, e, i, o, u) in it. Count both uppercase and lowercase vowels.",
    inputFormat: "A single line containing a string s.",
    outputFormat: "Print the count of vowels.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "hello", expectedOutput: "2", explanation: "'e' and 'o' are the vowels in 'hello'." },
      { input: "AEIOU", expectedOutput: "5" }
    ],
    hiddenTestCases: [
      { input: "bcdfg", expectedOutput: "0" },
      { input: "aeiouAEIOU", expectedOutput: "10" },
      { input: "Python", expectedOutput: "1" },
      { input: "a", expectedOutput: "1" },
      { input: "Programming", expectedOutput: "3" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nprint(sum(1 for c in s if c.lower() in 'aeiou'))`,
    evaluationType: "python"
  },
  {
    id: 105,
    title: "Factorial",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a non-negative integer n, compute n! (n factorial).",
    inputFormat: "A single integer n.",
    outputFormat: "Print n!.",
    constraints: "0 <= n <= 20",
    sampleTestCases: [
      { input: "5", expectedOutput: "120", explanation: "5! = 5*4*3*2*1 = 120" },
      { input: "0", expectedOutput: "1" }
    ],
    hiddenTestCases: [
      { input: "1", expectedOutput: "1" },
      { input: "10", expectedOutput: "3628800" },
      { input: "7", expectedOutput: "5040" },
      { input: "3", expectedOutput: "6" },
      { input: "12", expectedOutput: "479001600" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nresult = 1\nfor i in range(1, n + 1):\n    result *= i\nprint(result)`,
    evaluationType: "python"
  },
  {
    id: 106,
    title: "Check Palindrome",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string, check if it is a palindrome (reads the same forwards and backwards). The check is case-sensitive.",
    inputFormat: "A single line containing a string s.",
    outputFormat: "Print 'Yes' if the string is a palindrome, otherwise print 'No'.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "racecar", expectedOutput: "Yes", explanation: "'racecar' reads the same forwards and backwards." },
      { input: "hello", expectedOutput: "No" }
    ],
    hiddenTestCases: [
      { input: "madam", expectedOutput: "Yes" },
      { input: "a", expectedOutput: "Yes" },
      { input: "ab", expectedOutput: "No" },
      { input: "abba", expectedOutput: "Yes" },
      { input: "Racecar", expectedOutput: "No" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nprint("Yes" if s == s[::-1] else "No")`,
    evaluationType: "python"
  },
  {
    id: 107,
    title: "Fibonacci Number",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a non-negative integer n, print the nth Fibonacci number. The Fibonacci sequence is defined as F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
    inputFormat: "A single integer n.",
    outputFormat: "Print the nth Fibonacci number.",
    constraints: "0 <= n <= 30",
    sampleTestCases: [
      { input: "6", expectedOutput: "8", explanation: "F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3, F(5)=5, F(6)=8" },
      { input: "0", expectedOutput: "0" }
    ],
    hiddenTestCases: [
      { input: "1", expectedOutput: "1" },
      { input: "10", expectedOutput: "55" },
      { input: "2", expectedOutput: "1" },
      { input: "15", expectedOutput: "610" },
      { input: "20", expectedOutput: "6765" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\na, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nprint(a)`,
    evaluationType: "python"
  },
  {
    id: 108,
    title: "Count Words",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a sentence, count the number of words in it. Words are separated by spaces.",
    inputFormat: "A single line containing a sentence.",
    outputFormat: "Print the number of words.",
    constraints: "1 <= len(sentence) <= 1000",
    sampleTestCases: [
      { input: "Hello World", expectedOutput: "2", explanation: "There are 2 words: 'Hello' and 'World'." },
      { input: "I love Python programming", expectedOutput: "4" }
    ],
    hiddenTestCases: [
      { input: "Hello", expectedOutput: "1" },
      { input: "one two three four five", expectedOutput: "5" },
      { input: "a b c", expectedOutput: "3" },
      { input: "The quick brown fox jumps", expectedOutput: "5" },
      { input: "test", expectedOutput: "1" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nprint(len(s.split()))`,
    evaluationType: "python"
  },
  {
    id: 109,
    title: "Sum of Digits",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a non-negative integer n, find the sum of its digits.",
    inputFormat: "A single non-negative integer n.",
    outputFormat: "Print the sum of the digits of n.",
    constraints: "0 <= n <= 10^9",
    sampleTestCases: [
      { input: "123", expectedOutput: "6", explanation: "1 + 2 + 3 = 6" },
      { input: "9999", expectedOutput: "36" }
    ],
    hiddenTestCases: [
      { input: "0", expectedOutput: "0" },
      { input: "5", expectedOutput: "5" },
      { input: "1000000", expectedOutput: "1" },
      { input: "999999999", expectedOutput: "81" },
      { input: "12345", expectedOutput: "15" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = input().strip()\nprint(sum(int(d) for d in n))`,
    evaluationType: "python"
  },
  {
    id: 110,
    title: "Even or Odd",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given an integer n, determine if it is even or odd.",
    inputFormat: "A single integer n.",
    outputFormat: "Print 'Even' if n is even, otherwise print 'Odd'.",
    constraints: "-10^6 <= n <= 10^6",
    sampleTestCases: [
      { input: "4", expectedOutput: "Even", explanation: "4 is divisible by 2, so it is even." },
      { input: "7", expectedOutput: "Odd" }
    ],
    hiddenTestCases: [
      { input: "0", expectedOutput: "Even" },
      { input: "-3", expectedOutput: "Odd" },
      { input: "1000000", expectedOutput: "Even" },
      { input: "1", expectedOutput: "Odd" },
      { input: "-2", expectedOutput: "Even" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nprint("Even" if n % 2 == 0 else "Odd")`,
    evaluationType: "python"
  },
  {
    id: 111,
    title: "Find Minimum",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n numbers, find the minimum value.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the minimum value.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5\n3 1 4 1 5", expectedOutput: "1", explanation: "The minimum value among 3, 1, 4, 1, 5 is 1." },
      { input: "3\n10 20 5", expectedOutput: "5" }
    ],
    hiddenTestCases: [
      { input: "1\n42", expectedOutput: "42" },
      { input: "4\n-5 -2 -8 -1", expectedOutput: "-8" },
      { input: "6\n100 200 300 400 500 50", expectedOutput: "50" },
      { input: "3\n0 0 0", expectedOutput: "0" },
      { input: "5\n-1000000 1000000 0 999999 -999999", expectedOutput: "-1000000" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nprint(min(nums))`,
    evaluationType: "python"
  },
  {
    id: 112,
    title: "Reverse Number",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a non-negative integer, reverse its digits and print the result. Leading zeros after reversal should be dropped.",
    inputFormat: "A single non-negative integer n.",
    outputFormat: "Print the reversed number.",
    constraints: "0 <= n <= 10^9",
    sampleTestCases: [
      { input: "1234", expectedOutput: "4321", explanation: "Reversing 1234 gives 4321." },
      { input: "1000", expectedOutput: "1" }
    ],
    hiddenTestCases: [
      { input: "0", expectedOutput: "0" },
      { input: "5", expectedOutput: "5" },
      { input: "100", expectedOutput: "1" },
      { input: "123456789", expectedOutput: "987654321" },
      { input: "9900", expectedOutput: "99" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = input().strip()\nprint(int(n[::-1]))`,
    evaluationType: "python"
  },
  {
    id: 113,
    title: "Count Characters",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string and a character, count the number of times the character appears in the string. The match is case-sensitive.",
    inputFormat: "First line contains a string s. Second line contains a single character c.",
    outputFormat: "Print the count of character c in string s.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "hello world\nl", expectedOutput: "3", explanation: "'l' appears 3 times in 'hello world'." },
      { input: "banana\na", expectedOutput: "3" }
    ],
    hiddenTestCases: [
      { input: "aaa\na", expectedOutput: "3" },
      { input: "hello\nz", expectedOutput: "0" },
      { input: "Mississippi\ns", expectedOutput: "4" },
      { input: "HELLO\nH", expectedOutput: "1" },
      { input: "abcabcabc\nc", expectedOutput: "3" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nc = input()\nprint(s.count(c))`,
    evaluationType: "python"
  },
  {
    id: 114,
    title: "Armstrong Number",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a positive integer n, check if it is an Armstrong number. An Armstrong number of d digits is a number where the sum of each digit raised to the power d equals the number itself.",
    inputFormat: "A single positive integer n.",
    outputFormat: "Print 'Yes' if n is an Armstrong number, otherwise print 'No'.",
    constraints: "1 <= n <= 10^6",
    sampleTestCases: [
      { input: "153", expectedOutput: "Yes", explanation: "153 has 3 digits: 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153." },
      { input: "123", expectedOutput: "No" }
    ],
    hiddenTestCases: [
      { input: "1", expectedOutput: "Yes" },
      { input: "9", expectedOutput: "Yes" },
      { input: "370", expectedOutput: "Yes" },
      { input: "407", expectedOutput: "Yes" },
      { input: "100", expectedOutput: "No" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = input().strip()\nd = len(n)\nresult = sum(int(c) ** d for c in n)\nprint("Yes" if result == int(n) else "No")`,
    evaluationType: "python"
  },
  {
    id: 115,
    title: "Swap Two Numbers",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two integers a and b, print them in swapped order.",
    inputFormat: "A single line containing two space-separated integers a and b.",
    outputFormat: "Print b and a separated by a space.",
    constraints: "-10^6 <= a, b <= 10^6",
    sampleTestCases: [
      { input: "3 5", expectedOutput: "5 3", explanation: "Swapping 3 and 5 gives 5 and 3." },
      { input: "10 20", expectedOutput: "20 10" }
    ],
    hiddenTestCases: [
      { input: "0 0", expectedOutput: "0 0" },
      { input: "-1 1", expectedOutput: "1 -1" },
      { input: "100 200", expectedOutput: "200 100" },
      { input: "999999 -999999", expectedOutput: "-999999 999999" },
      { input: "7 7", expectedOutput: "7 7" }
    ],
    starterCode: `# Read input\n`,
    solution: `a, b = map(int, input().split())\nprint(b, a)`,
    evaluationType: "python"
  },
  {
    id: 116,
    title: "Simple Interest",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given principal P, rate R (percentage), and time T (years), calculate simple interest using the formula SI = P * R * T / 100. Print the result as a float with 2 decimal places.",
    inputFormat: "A single line containing three space-separated numbers P, R, and T.",
    outputFormat: "Print the simple interest with exactly 2 decimal places.",
    constraints: "0 <= P, R, T <= 10^6",
    sampleTestCases: [
      { input: "1000 5 2", expectedOutput: "100.00", explanation: "SI = 1000 * 5 * 2 / 100 = 100.00" },
      { input: "5000 3.5 4", expectedOutput: "700.00" }
    ],
    hiddenTestCases: [
      { input: "0 5 2", expectedOutput: "0.00" },
      { input: "1000 0 5", expectedOutput: "0.00" },
      { input: "10000 10 1", expectedOutput: "1000.00" },
      { input: "2500 7.5 3", expectedOutput: "562.50" },
      { input: "100 1 1", expectedOutput: "1.00" }
    ],
    starterCode: `# Read input\n`,
    solution: `P, R, T = map(float, input().split())\nsi = P * R * T / 100\nprint(f"{si:.2f}")`,
    evaluationType: "python"
  },
  {
    id: 117,
    title: "Celsius to Fahrenheit",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a temperature in Celsius, convert it to Fahrenheit using the formula F = C * 9/5 + 32. Print the result with 2 decimal places.",
    inputFormat: "A single number C (the temperature in Celsius).",
    outputFormat: "Print the temperature in Fahrenheit with exactly 2 decimal places.",
    constraints: "-273.15 <= C <= 10^6",
    sampleTestCases: [
      { input: "0", expectedOutput: "32.00", explanation: "0 Celsius = 32.00 Fahrenheit." },
      { input: "100", expectedOutput: "212.00" }
    ],
    hiddenTestCases: [
      { input: "-40", expectedOutput: "-40.00" },
      { input: "37", expectedOutput: "98.60" },
      { input: "-273.15", expectedOutput: "-459.67" },
      { input: "25", expectedOutput: "77.00" },
      { input: "1", expectedOutput: "33.80" }
    ],
    starterCode: `# Read input\n`,
    solution: `C = float(input())\nF = C * 9 / 5 + 32\nprint(f"{F:.2f}")`,
    evaluationType: "python"
  },
  {
    id: 118,
    title: "List Average",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n numbers, compute their average and print it with 2 decimal places.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the average with exactly 2 decimal places.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "4\n10 20 30 40", expectedOutput: "25.00", explanation: "(10+20+30+40)/4 = 25.00" },
      { input: "3\n1 2 3", expectedOutput: "2.00" }
    ],
    hiddenTestCases: [
      { input: "1\n5", expectedOutput: "5.00" },
      { input: "5\n0 0 0 0 0", expectedOutput: "0.00" },
      { input: "2\n1 2", expectedOutput: "1.50" },
      { input: "3\n-3 0 3", expectedOutput: "0.00" },
      { input: "4\n7 8 9 10", expectedOutput: "8.50" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nprint(f"{sum(nums)/n:.2f}")`,
    evaluationType: "python"
  },
  {
    id: 119,
    title: "Remove Duplicates",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a list of integers, remove duplicates while preserving the original order of first occurrences. Print the resulting list space-separated.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the list with duplicates removed, space-separated.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "7\n1 2 3 2 1 4 3", expectedOutput: "1 2 3 4", explanation: "Remove duplicate occurrences while preserving order." },
      { input: "5\n5 5 5 5 5", expectedOutput: "5" }
    ],
    hiddenTestCases: [
      { input: "1\n1", expectedOutput: "1" },
      { input: "6\n1 2 3 4 5 6", expectedOutput: "1 2 3 4 5 6" },
      { input: "8\n4 3 2 1 4 3 2 1", expectedOutput: "4 3 2 1" },
      { input: "4\n10 20 10 20", expectedOutput: "10 20" },
      { input: "5\n-1 -1 2 2 3", expectedOutput: "-1 2 3" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nseen = set()\nresult = []\nfor x in nums:\n    if x not in seen:\n        seen.add(x)\n        result.append(x)\nprint(' '.join(map(str, result)))`,
    evaluationType: "python"
  },
  {
    id: 120,
    title: "Second Largest",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n integers, find the second largest distinct value.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the second largest distinct value.",
    constraints: "2 <= n <= 1000\nThere are at least 2 distinct values.",
    sampleTestCases: [
      { input: "5\n3 1 4 1 5", expectedOutput: "4", explanation: "Distinct values sorted: 1, 3, 4, 5. Second largest is 4." },
      { input: "4\n10 20 20 30", expectedOutput: "20" }
    ],
    hiddenTestCases: [
      { input: "2\n1 2", expectedOutput: "1" },
      { input: "6\n5 5 5 3 3 3", expectedOutput: "3" },
      { input: "5\n100 200 300 400 500", expectedOutput: "400" },
      { input: "4\n-1 -2 -3 -4", expectedOutput: "-2" },
      { input: "3\n0 1000000 -1000000", expectedOutput: "0" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nunique = sorted(set(nums), reverse=True)\nprint(unique[1])`,
    evaluationType: "python"
  },
  {
    id: 121,
    title: "Check Prime",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a positive integer n, determine if it is a prime number.",
    inputFormat: "A single positive integer n.",
    outputFormat: "Print 'Yes' if n is prime, otherwise print 'No'.",
    constraints: "1 <= n <= 10^6",
    sampleTestCases: [
      { input: "7", expectedOutput: "Yes", explanation: "7 is only divisible by 1 and 7, so it is prime." },
      { input: "4", expectedOutput: "No" }
    ],
    hiddenTestCases: [
      { input: "1", expectedOutput: "No" },
      { input: "2", expectedOutput: "Yes" },
      { input: "97", expectedOutput: "Yes" },
      { input: "100", expectedOutput: "No" },
      { input: "999983", expectedOutput: "Yes" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nif n < 2:\n    print("No")\nelse:\n    is_prime = True\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            is_prime = False\n            break\n    print("Yes" if is_prime else "No")`,
    evaluationType: "python"
  },
  {
    id: 122,
    title: "GCD of Two Numbers",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two positive integers a and b, find their Greatest Common Divisor (GCD).",
    inputFormat: "A single line containing two space-separated positive integers a and b.",
    outputFormat: "Print the GCD of a and b.",
    constraints: "1 <= a, b <= 10^6",
    sampleTestCases: [
      { input: "12 8", expectedOutput: "4", explanation: "The GCD of 12 and 8 is 4." },
      { input: "100 75", expectedOutput: "25" }
    ],
    hiddenTestCases: [
      { input: "1 1", expectedOutput: "1" },
      { input: "7 13", expectedOutput: "1" },
      { input: "24 36", expectedOutput: "12" },
      { input: "1000000 500000", expectedOutput: "500000" },
      { input: "17 17", expectedOutput: "17" }
    ],
    starterCode: `# Read input\n`,
    solution: `import math\na, b = map(int, input().split())\nprint(math.gcd(a, b))`,
    evaluationType: "python"
  },
  {
    id: 123,
    title: "LCM of Two Numbers",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two positive integers a and b, find their Least Common Multiple (LCM).",
    inputFormat: "A single line containing two space-separated positive integers a and b.",
    outputFormat: "Print the LCM of a and b.",
    constraints: "1 <= a, b <= 10^6",
    sampleTestCases: [
      { input: "4 6", expectedOutput: "12", explanation: "The LCM of 4 and 6 is 12." },
      { input: "3 5", expectedOutput: "15" }
    ],
    hiddenTestCases: [
      { input: "1 1", expectedOutput: "1" },
      { input: "7 13", expectedOutput: "91" },
      { input: "12 18", expectedOutput: "36" },
      { input: "100 25", expectedOutput: "100" },
      { input: "6 6", expectedOutput: "6" }
    ],
    starterCode: `# Read input\n`,
    solution: `import math\na, b = map(int, input().split())\nprint(a * b // math.gcd(a, b))`,
    evaluationType: "python"
  },
  {
    id: 124,
    title: "Power of Two",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a positive integer n, determine if it is a power of 2.",
    inputFormat: "A single positive integer n.",
    outputFormat: "Print 'Yes' if n is a power of 2, otherwise print 'No'.",
    constraints: "1 <= n <= 10^9",
    sampleTestCases: [
      { input: "8", expectedOutput: "Yes", explanation: "8 = 2^3, so it is a power of 2." },
      { input: "6", expectedOutput: "No" }
    ],
    hiddenTestCases: [
      { input: "1", expectedOutput: "Yes" },
      { input: "2", expectedOutput: "Yes" },
      { input: "1024", expectedOutput: "Yes" },
      { input: "1000", expectedOutput: "No" },
      { input: "536870912", expectedOutput: "Yes" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nprint("Yes" if n > 0 and (n & (n - 1)) == 0 else "No")`,
    evaluationType: "python"
  },
  {
    id: 125,
    title: "Count Even Odd",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n integers, count how many are even and how many are odd.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print two space-separated integers: the count of even numbers and the count of odd numbers.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "2 3", explanation: "Even: 2, 4 (count=2). Odd: 1, 3, 5 (count=3)." },
      { input: "4\n2 4 6 8", expectedOutput: "4 0" }
    ],
    hiddenTestCases: [
      { input: "1\n1", expectedOutput: "0 1" },
      { input: "1\n2", expectedOutput: "1 0" },
      { input: "6\n0 1 2 3 4 5", expectedOutput: "3 3" },
      { input: "3\n-2 -3 -4", expectedOutput: "2 1" },
      { input: "5\n0 0 0 0 0", expectedOutput: "5 0" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\neven = sum(1 for x in nums if x % 2 == 0)\nodd = n - even\nprint(even, odd)`,
    evaluationType: "python"
  },
  {
    id: 126,
    title: "Sort Array",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n integers, sort them in ascending order and print them space-separated.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the sorted integers space-separated.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5\n5 3 1 4 2", expectedOutput: "1 2 3 4 5", explanation: "Sorting in ascending order gives 1 2 3 4 5." },
      { input: "3\n30 10 20", expectedOutput: "10 20 30" }
    ],
    hiddenTestCases: [
      { input: "1\n42", expectedOutput: "42" },
      { input: "4\n-3 -1 -4 -2", expectedOutput: "-4 -3 -2 -1" },
      { input: "6\n6 5 4 3 2 1", expectedOutput: "1 2 3 4 5 6" },
      { input: "5\n1 1 1 1 1", expectedOutput: "1 1 1 1 1" },
      { input: "3\n0 -1 1", expectedOutput: "-1 0 1" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nnums.sort()\nprint(' '.join(map(str, nums)))`,
    evaluationType: "python"
  },
  {
    id: 127,
    title: "Merge Two Lists",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two lists of integers, merge them into one sorted list and print it space-separated.",
    inputFormat: "First line contains n. Second line contains n space-separated integers.\nThird line contains m. Fourth line contains m space-separated integers.",
    outputFormat: "Print the merged sorted list space-separated.",
    constraints: "1 <= n, m <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "3\n1 3 5\n3\n2 4 6", expectedOutput: "1 2 3 4 5 6", explanation: "Merging [1,3,5] and [2,4,6] and sorting gives [1,2,3,4,5,6]." },
      { input: "2\n10 30\n2\n20 40", expectedOutput: "10 20 30 40" }
    ],
    hiddenTestCases: [
      { input: "1\n1\n1\n2", expectedOutput: "1 2" },
      { input: "3\n5 5 5\n3\n5 5 5", expectedOutput: "5 5 5 5 5 5" },
      { input: "4\n-4 -3 -2 -1\n4\n1 2 3 4", expectedOutput: "-4 -3 -2 -1 1 2 3 4" },
      { input: "2\n100 200\n3\n50 150 250", expectedOutput: "50 100 150 200 250" },
      { input: "1\n0\n1\n0", expectedOutput: "0 0" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\na = list(map(int, input().split()))\nm = int(input())\nb = list(map(int, input().split()))\nresult = sorted(a + b)\nprint(' '.join(map(str, result)))`,
    evaluationType: "python"
  },
  {
    id: 128,
    title: "Common Elements",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two lists of integers, find the common elements (intersection) and print them in sorted order. Each common value should appear only once.",
    inputFormat: "First line contains n. Second line contains n space-separated integers.\nThird line contains m. Fourth line contains m space-separated integers.",
    outputFormat: "Print the common elements sorted in ascending order, space-separated. If no common elements, print 'None'.",
    constraints: "1 <= n, m <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5\n1 2 3 4 5\n4\n3 4 5 6", expectedOutput: "3 4 5", explanation: "The common elements are 3, 4, and 5." },
      { input: "3\n1 2 3\n3\n4 5 6", expectedOutput: "None" }
    ],
    hiddenTestCases: [
      { input: "3\n1 1 1\n3\n1 1 1", expectedOutput: "1" },
      { input: "4\n10 20 30 40\n4\n20 40 60 80", expectedOutput: "20 40" },
      { input: "5\n-5 -3 0 3 5\n5\n-5 -3 0 3 5", expectedOutput: "-5 -3 0 3 5" },
      { input: "2\n100 200\n2\n300 400", expectedOutput: "None" },
      { input: "4\n1 2 2 3\n4\n2 2 3 3", expectedOutput: "2 3" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\na = list(map(int, input().split()))\nm = int(input())\nb = list(map(int, input().split()))\ncommon = sorted(set(a) & set(b))\nif common:\n    print(' '.join(map(str, common)))\nelse:\n    print("None")`,
    evaluationType: "python"
  },
  {
    id: 129,
    title: "Title Case",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string, convert it to title case (first letter of each word capitalized, rest lowercase).",
    inputFormat: "A single line containing a string.",
    outputFormat: "Print the title-cased string.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "hello world", expectedOutput: "Hello World", explanation: "Each word's first letter is capitalized." },
      { input: "python is fun", expectedOutput: "Python Is Fun" }
    ],
    hiddenTestCases: [
      { input: "HELLO WORLD", expectedOutput: "Hello World" },
      { input: "a", expectedOutput: "A" },
      { input: "the quick brown fox", expectedOutput: "The Quick Brown Fox" },
      { input: "ONE TWO THREE", expectedOutput: "One Two Three" },
      { input: "test", expectedOutput: "Test" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nprint(s.title())`,
    evaluationType: "python"
  },
  {
    id: 130,
    title: "Capitalize First Letter",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string, capitalize the first letter of each word while keeping all other characters unchanged.",
    inputFormat: "A single line containing a string.",
    outputFormat: "Print the string with the first letter of each word capitalized (other characters unchanged).",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "hello world", expectedOutput: "Hello World", explanation: "First letter of each word is capitalized." },
      { input: "good morning everyone", expectedOutput: "Good Morning Everyone" }
    ],
    hiddenTestCases: [
      { input: "a", expectedOutput: "A" },
      { input: "already Capital", expectedOutput: "Already Capital" },
      { input: "one", expectedOutput: "One" },
      { input: "hello WORLD", expectedOutput: "Hello WORLD" },
      { input: "x y z", expectedOutput: "X Y Z" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nwords = s.split(' ')\nresult = []\nfor w in words:\n    if w:\n        result.append(w[0].upper() + w[1:])\n    else:\n        result.append(w)\nprint(' '.join(result))`,
    evaluationType: "python"
  },
  {
    id: 131,
    title: "Replace Spaces",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string, replace all spaces with hyphens (-).",
    inputFormat: "A single line containing a string.",
    outputFormat: "Print the modified string with spaces replaced by hyphens.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "hello world", expectedOutput: "hello-world", explanation: "Space is replaced by hyphen." },
      { input: "I love coding", expectedOutput: "I-love-coding" }
    ],
    hiddenTestCases: [
      { input: "no spaces", expectedOutput: "no-spaces" },
      { input: "a", expectedOutput: "a" },
      { input: "a b c d e", expectedOutput: "a-b-c-d-e" },
      { input: "hello", expectedOutput: "hello" },
      { input: "one two three four", expectedOutput: "one-two-three-four" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nprint(s.replace(' ', '-'))`,
    evaluationType: "python"
  },
  {
    id: 132,
    title: "String Compression",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a string consisting of lowercase letters, compress it by replacing consecutive identical characters with the character followed by the count. For example, 'aabccc' becomes 'a2b1c3'.",
    inputFormat: "A single line containing a string of lowercase letters.",
    outputFormat: "Print the compressed string.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "aabccc", expectedOutput: "a2b1c3", explanation: "'aa' -> 'a2', 'b' -> 'b1', 'ccc' -> 'c3'" },
      { input: "aaabbb", expectedOutput: "a3b3" }
    ],
    hiddenTestCases: [
      { input: "a", expectedOutput: "a1" },
      { input: "abcd", expectedOutput: "a1b1c1d1" },
      { input: "aaa", expectedOutput: "a3" },
      { input: "aabbcc", expectedOutput: "a2b2c2" },
      { input: "abbbccccdd", expectedOutput: "a1b3c4d2" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nif not s:\n    print("")\nelse:\n    result = []\n    count = 1\n    for i in range(1, len(s)):\n        if s[i] == s[i-1]:\n            count += 1\n        else:\n            result.append(s[i-1] + str(count))\n            count = 1\n    result.append(s[-1] + str(count))\n    print(''.join(result))`,
    evaluationType: "python"
  },
  {
    id: 133,
    title: "Check Anagram",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two strings, check if they are anagrams of each other. Two strings are anagrams if they contain the same characters with the same frequencies. The check is case-insensitive.",
    inputFormat: "First line contains string s1. Second line contains string s2.",
    outputFormat: "Print 'Yes' if the strings are anagrams, otherwise print 'No'.",
    constraints: "1 <= len(s1), len(s2) <= 1000",
    sampleTestCases: [
      { input: "listen\nsilent", expectedOutput: "Yes", explanation: "'listen' and 'silent' contain the same characters." },
      { input: "hello\nworld", expectedOutput: "No" }
    ],
    hiddenTestCases: [
      { input: "Triangle\nIntegral", expectedOutput: "Yes" },
      { input: "a\na", expectedOutput: "Yes" },
      { input: "ab\nba", expectedOutput: "Yes" },
      { input: "abc\nabcd", expectedOutput: "No" },
      { input: "Astronomer\nMoonStarer", expectedOutput: "Yes" }
    ],
    starterCode: `# Read input\n`,
    solution: `s1 = input().lower()\ns2 = input().lower()\nprint("Yes" if sorted(s1) == sorted(s2) else "No")`,
    evaluationType: "python"
  },
  {
    id: 134,
    title: "Rotate Array Left",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given an array of n integers and a value k, rotate the array to the left by k positions. Print the resulting array space-separated.",
    inputFormat: "First line contains two space-separated integers n and k. Second line contains n space-separated integers.",
    outputFormat: "Print the rotated array space-separated.",
    constraints: "1 <= n <= 1000\n0 <= k <= n\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "5 2\n1 2 3 4 5", expectedOutput: "3 4 5 1 2", explanation: "Rotating [1,2,3,4,5] left by 2 gives [3,4,5,1,2]." },
      { input: "4 1\n10 20 30 40", expectedOutput: "20 30 40 10" }
    ],
    hiddenTestCases: [
      { input: "5 0\n1 2 3 4 5", expectedOutput: "1 2 3 4 5" },
      { input: "5 5\n1 2 3 4 5", expectedOutput: "1 2 3 4 5" },
      { input: "3 1\n7 8 9", expectedOutput: "8 9 7" },
      { input: "1 0\n42", expectedOutput: "42" },
      { input: "6 3\n10 20 30 40 50 60", expectedOutput: "40 50 60 10 20 30" }
    ],
    starterCode: `# Read input\n`,
    solution: `n, k = map(int, input().split())\nnums = list(map(int, input().split()))\nk = k % n\nresult = nums[k:] + nums[:k]\nprint(' '.join(map(str, result)))`,
    evaluationType: "python"
  },
  {
    id: 135,
    title: "Missing Number",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given an array of n-1 distinct integers in the range 1 to n, find the missing number.",
    inputFormat: "First line contains an integer n. Second line contains n-1 space-separated integers.",
    outputFormat: "Print the missing number.",
    constraints: "2 <= n <= 10000",
    sampleTestCases: [
      { input: "5\n1 2 4 5", expectedOutput: "3", explanation: "In range 1-5, the number 3 is missing." },
      { input: "4\n1 3 4", expectedOutput: "2" }
    ],
    hiddenTestCases: [
      { input: "2\n1", expectedOutput: "2" },
      { input: "2\n2", expectedOutput: "1" },
      { input: "6\n1 2 3 5 6", expectedOutput: "4" },
      { input: "3\n1 3", expectedOutput: "2" },
      { input: "10\n1 2 3 4 5 6 7 8 10", expectedOutput: "9" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nexpected = n * (n + 1) // 2\nprint(expected - sum(nums))`,
    evaluationType: "python"
  },
  {
    id: 136,
    title: "Two Sum",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given an array of integers and a target value, find two indices (0-based) such that the elements at those indices sum to the target. Print the two indices space-separated (smaller index first). There is exactly one solution.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers. Third line contains the target integer.",
    outputFormat: "Print the two indices space-separated.",
    constraints: "2 <= n <= 1000\n-10^6 <= each element, target <= 10^6",
    sampleTestCases: [
      { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9." },
      { input: "3\n3 2 4\n6", expectedOutput: "1 2" }
    ],
    hiddenTestCases: [
      { input: "2\n1 2\n3", expectedOutput: "0 1" },
      { input: "5\n1 5 3 7 2\n8", expectedOutput: "1 2" },
      { input: "4\n-1 -2 -3 -4\n-7", expectedOutput: "2 3" },
      { input: "6\n10 20 30 40 50 60\n70", expectedOutput: "2 3" },
      { input: "3\n0 4 3\n3", expectedOutput: "0 2" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\ntarget = int(input())\nseen = {}\nfor i, x in enumerate(nums):\n    complement = target - x\n    if complement in seen:\n        print(seen[complement], i)\n        break\n    seen[x] = i`,
    evaluationType: "python"
  },
  {
    id: 137,
    title: "Matrix Sum",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a matrix of integers with r rows and c columns, find the sum of all elements.",
    inputFormat: "First line contains two space-separated integers r and c. Next r lines each contain c space-separated integers.",
    outputFormat: "Print the sum of all elements in the matrix.",
    constraints: "1 <= r, c <= 100\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "2 3\n1 2 3\n4 5 6", expectedOutput: "21", explanation: "1+2+3+4+5+6 = 21" },
      { input: "2 2\n10 20\n30 40", expectedOutput: "100" }
    ],
    hiddenTestCases: [
      { input: "1 1\n5", expectedOutput: "5" },
      { input: "3 3\n1 0 0\n0 1 0\n0 0 1", expectedOutput: "3" },
      { input: "2 4\n-1 -2 -3 -4\n1 2 3 4", expectedOutput: "0" },
      { input: "1 5\n10 20 30 40 50", expectedOutput: "150" },
      { input: "3 2\n100 200\n300 400\n500 600", expectedOutput: "2100" }
    ],
    starterCode: `# Read input\n`,
    solution: `r, c = map(int, input().split())\ntotal = 0\nfor _ in range(r):\n    row = list(map(int, input().split()))\n    total += sum(row)\nprint(total)`,
    evaluationType: "python"
  },
  {
    id: 138,
    title: "Transpose Matrix",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a matrix with r rows and c columns, print its transpose. The transpose swaps rows and columns.",
    inputFormat: "First line contains two space-separated integers r and c. Next r lines each contain c space-separated integers.",
    outputFormat: "Print the transposed matrix, with each row on a new line and elements space-separated.",
    constraints: "1 <= r, c <= 100\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "2 3\n1 2 3\n4 5 6", expectedOutput: "1 4\n2 5\n3 6", explanation: "Rows become columns in the transpose." },
      { input: "2 2\n1 2\n3 4", expectedOutput: "1 3\n2 4" }
    ],
    hiddenTestCases: [
      { input: "1 1\n5", expectedOutput: "5" },
      { input: "1 3\n1 2 3", expectedOutput: "1\n2\n3" },
      { input: "3 1\n1\n2\n3", expectedOutput: "1 2 3" },
      { input: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 4 7\n2 5 8\n3 6 9" },
      { input: "2 4\n1 2 3 4\n5 6 7 8", expectedOutput: "1 5\n2 6\n3 7\n4 8" }
    ],
    starterCode: `# Read input\n`,
    solution: `r, c = map(int, input().split())\nmatrix = []\nfor _ in range(r):\n    matrix.append(list(map(int, input().split())))\nfor j in range(c):\n    print(' '.join(str(matrix[i][j]) for i in range(r)))`,
    evaluationType: "python"
  },
  {
    id: 139,
    title: "Flatten List",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a nested list (one level of nesting), flatten it and print the elements space-separated. The input represents a list of sublists where each sublist is on a separate line.",
    inputFormat: "First line contains n (the number of sublists). Next n lines each contain space-separated integers representing a sublist.",
    outputFormat: "Print all elements in order, space-separated.",
    constraints: "1 <= n <= 100\nEach sublist has 1 to 100 elements.",
    sampleTestCases: [
      { input: "3\n1 2 3\n4 5\n6 7 8 9", expectedOutput: "1 2 3 4 5 6 7 8 9", explanation: "All sublists concatenated: [1,2,3,4,5,6,7,8,9]" },
      { input: "2\n10 20\n30 40", expectedOutput: "10 20 30 40" }
    ],
    hiddenTestCases: [
      { input: "1\n1 2 3", expectedOutput: "1 2 3" },
      { input: "3\n1\n2\n3", expectedOutput: "1 2 3" },
      { input: "4\n1 2\n3 4\n5 6\n7 8", expectedOutput: "1 2 3 4 5 6 7 8" },
      { input: "2\n-1 -2\n-3 -4", expectedOutput: "-1 -2 -3 -4" },
      { input: "1\n42", expectedOutput: "42" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nresult = []\nfor _ in range(n):\n    result.extend(input().split())\nprint(' '.join(result))`,
    evaluationType: "python"
  },
  {
    id: 140,
    title: "Dictionary Merge",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two dictionaries (as key:value pairs), merge them. If a key exists in both, the value from the second dictionary takes precedence. Print the merged dictionary with keys sorted alphabetically, one key-value pair per line in 'key:value' format.",
    inputFormat: "First line contains n (number of pairs in dict1). Next n lines contain 'key:value' pairs.\nThen m (number of pairs in dict2). Next m lines contain 'key:value' pairs. Values are integers.",
    outputFormat: "Print the merged dictionary sorted by keys, one 'key:value' pair per line.",
    constraints: "0 <= n, m <= 100",
    sampleTestCases: [
      { input: "2\na:1\nb:2\n2\nb:3\nc:4", expectedOutput: "a:1\nb:3\nc:4", explanation: "Key 'b' appears in both; second dict value (3) takes precedence." },
      { input: "1\nx:10\n1\ny:20", expectedOutput: "x:10\ny:20" }
    ],
    hiddenTestCases: [
      { input: "0\n1\na:1", expectedOutput: "a:1" },
      { input: "1\na:1\n0", expectedOutput: "a:1" },
      { input: "3\na:1\nb:2\nc:3\n3\na:10\nb:20\nc:30", expectedOutput: "a:10\nb:20\nc:30" },
      { input: "2\nm:5\nz:9\n2\na:1\nm:3", expectedOutput: "a:1\nm:3\nz:9" },
      { input: "1\nhello:42\n1\nworld:99", expectedOutput: "hello:42\nworld:99" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nd = {}\nfor _ in range(n):\n    parts = input().split(':')\n    d[parts[0]] = parts[1]\nm = int(input())\nfor _ in range(m):\n    parts = input().split(':')\n    d[parts[0]] = parts[1]\nfor k in sorted(d.keys()):\n    print(f"{k}:{d[k]}")`,
    evaluationType: "python"
  },
  {
    id: 141,
    title: "Frequency Count",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n integers, count the frequency of each element and print each element with its frequency, sorted by element value in ascending order.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print each unique element and its frequency on a separate line as 'element count', sorted by element value.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "7\n1 2 2 3 3 3 1", expectedOutput: "1 2\n2 2\n3 3", explanation: "1 appears 2 times, 2 appears 2 times, 3 appears 3 times." },
      { input: "5\n5 5 5 5 5", expectedOutput: "5 5" }
    ],
    hiddenTestCases: [
      { input: "1\n42", expectedOutput: "42 1" },
      { input: "6\n3 1 2 1 2 3", expectedOutput: "1 2\n2 2\n3 2" },
      { input: "4\n-1 -1 1 1", expectedOutput: "-1 2\n1 2" },
      { input: "3\n10 20 30", expectedOutput: "10 1\n20 1\n30 1" },
      { input: "8\n1 1 1 2 2 3 3 3", expectedOutput: "1 3\n2 2\n3 3" }
    ],
    starterCode: `# Read input\n`,
    solution: `from collections import Counter\nn = int(input())\nnums = list(map(int, input().split()))\nfreq = Counter(nums)\nfor k in sorted(freq.keys()):\n    print(k, freq[k])`,
    evaluationType: "python"
  },
  {
    id: 142,
    title: "Find Duplicates",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n integers, find and print the duplicate elements (elements that appear more than once) in sorted order. Each duplicate should be printed only once.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print duplicate elements sorted in ascending order, space-separated. If no duplicates, print 'None'.",
    constraints: "1 <= n <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "7\n1 2 3 2 4 3 5", expectedOutput: "2 3", explanation: "2 and 3 appear more than once." },
      { input: "4\n1 2 3 4", expectedOutput: "None" }
    ],
    hiddenTestCases: [
      { input: "1\n1", expectedOutput: "None" },
      { input: "6\n1 1 2 2 3 3", expectedOutput: "1 2 3" },
      { input: "5\n5 5 5 5 5", expectedOutput: "5" },
      { input: "8\n10 20 30 10 20 40 50 60", expectedOutput: "10 20" },
      { input: "4\n-1 -1 -2 -2", expectedOutput: "-2 -1" }
    ],
    starterCode: `# Read input\n`,
    solution: `from collections import Counter\nn = int(input())\nnums = list(map(int, input().split()))\nfreq = Counter(nums)\ndupes = sorted([k for k, v in freq.items() if v > 1])\nif dupes:\n    print(' '.join(map(str, dupes)))\nelse:\n    print("None")`,
    evaluationType: "python"
  },
  {
    id: 143,
    title: "Rectangle Area",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given the length and width of a rectangle, compute and print its area.",
    inputFormat: "A single line containing two space-separated integers: length and width.",
    outputFormat: "Print the area of the rectangle.",
    constraints: "1 <= length, width <= 10^6",
    sampleTestCases: [
      { input: "5 3", expectedOutput: "15", explanation: "Area = 5 * 3 = 15" },
      { input: "10 10", expectedOutput: "100" }
    ],
    hiddenTestCases: [
      { input: "1 1", expectedOutput: "1" },
      { input: "1000 1000", expectedOutput: "1000000" },
      { input: "7 8", expectedOutput: "56" },
      { input: "100 1", expectedOutput: "100" },
      { input: "999 999", expectedOutput: "998001" }
    ],
    starterCode: `# Read input\n`,
    solution: `l, w = map(int, input().split())\nprint(l * w)`,
    evaluationType: "python"
  },
  {
    id: 144,
    title: "Triangle Type",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given three sides of a triangle, determine if it is equilateral (all sides equal), isosceles (exactly two sides equal), or scalene (all sides different).",
    inputFormat: "A single line containing three space-separated positive integers: the three sides.",
    outputFormat: "Print 'Equilateral', 'Isosceles', or 'Scalene'.",
    constraints: "1 <= each side <= 10^6. The three sides always form a valid triangle.",
    sampleTestCases: [
      { input: "5 5 5", expectedOutput: "Equilateral", explanation: "All three sides are equal." },
      { input: "3 4 5", expectedOutput: "Scalene" }
    ],
    hiddenTestCases: [
      { input: "5 5 3", expectedOutput: "Isosceles" },
      { input: "1 1 1", expectedOutput: "Equilateral" },
      { input: "7 8 9", expectedOutput: "Scalene" },
      { input: "10 10 5", expectedOutput: "Isosceles" },
      { input: "3 5 3", expectedOutput: "Isosceles" }
    ],
    starterCode: `# Read input\n`,
    solution: `a, b, c = map(int, input().split())\nif a == b == c:\n    print("Equilateral")\nelif a == b or b == c or a == c:\n    print("Isosceles")\nelse:\n    print("Scalene")`,
    evaluationType: "python"
  },
  {
    id: 145,
    title: "Leap Year",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a year, determine if it is a leap year. A year is a leap year if: it is divisible by 4 AND (not divisible by 100 OR divisible by 400).",
    inputFormat: "A single integer representing the year.",
    outputFormat: "Print 'Yes' if it is a leap year, otherwise print 'No'.",
    constraints: "1 <= year <= 10^6",
    sampleTestCases: [
      { input: "2024", expectedOutput: "Yes", explanation: "2024 is divisible by 4 and not by 100, so it is a leap year." },
      { input: "1900", expectedOutput: "No" }
    ],
    hiddenTestCases: [
      { input: "2000", expectedOutput: "Yes" },
      { input: "2023", expectedOutput: "No" },
      { input: "400", expectedOutput: "Yes" },
      { input: "100", expectedOutput: "No" },
      { input: "4", expectedOutput: "Yes" }
    ],
    starterCode: `# Read input\n`,
    solution: `year = int(input())\nif (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):\n    print("Yes")\nelse:\n    print("No")`,
    evaluationType: "python"
  },
  {
    id: 146,
    title: "Binary to Decimal",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a binary string (consisting of 0s and 1s), convert it to its decimal equivalent.",
    inputFormat: "A single line containing a binary string.",
    outputFormat: "Print the decimal equivalent.",
    constraints: "1 <= len(binary_string) <= 30",
    sampleTestCases: [
      { input: "1010", expectedOutput: "10", explanation: "1010 in binary = 10 in decimal." },
      { input: "1111", expectedOutput: "15" }
    ],
    hiddenTestCases: [
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "11111111", expectedOutput: "255" },
      { input: "10000000", expectedOutput: "128" },
      { input: "101010", expectedOutput: "42" }
    ],
    starterCode: `# Read input\n`,
    solution: `b = input().strip()\nprint(int(b, 2))`,
    evaluationType: "python"
  },
  {
    id: 147,
    title: "Decimal to Binary",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given a non-negative decimal integer, convert it to its binary representation (without the '0b' prefix).",
    inputFormat: "A single non-negative integer n.",
    outputFormat: "Print the binary representation of n.",
    constraints: "0 <= n <= 10^9",
    sampleTestCases: [
      { input: "10", expectedOutput: "1010", explanation: "10 in decimal = 1010 in binary." },
      { input: "255", expectedOutput: "11111111" }
    ],
    hiddenTestCases: [
      { input: "0", expectedOutput: "0" },
      { input: "1", expectedOutput: "1" },
      { input: "128", expectedOutput: "10000000" },
      { input: "42", expectedOutput: "101010" },
      { input: "1000000", expectedOutput: "11110100001001000000" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nprint(bin(n)[2:])`,
    evaluationType: "python"
  },
  {
    id: 148,
    title: "List Intersection",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given two lists of integers, find their intersection (elements that appear in both lists). Print the unique intersection elements in sorted order. If there is no intersection, print 'None'.",
    inputFormat: "First line contains n. Second line contains n space-separated integers.\nThird line contains m. Fourth line contains m space-separated integers.",
    outputFormat: "Print the intersection elements sorted in ascending order, space-separated. If empty, print 'None'.",
    constraints: "1 <= n, m <= 1000\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "4\n1 2 3 4\n4\n3 4 5 6", expectedOutput: "3 4", explanation: "3 and 4 appear in both lists." },
      { input: "3\n1 2 3\n3\n4 5 6", expectedOutput: "None" }
    ],
    hiddenTestCases: [
      { input: "5\n1 2 3 4 5\n5\n1 2 3 4 5", expectedOutput: "1 2 3 4 5" },
      { input: "3\n-1 0 1\n3\n0 1 2", expectedOutput: "0 1" },
      { input: "4\n10 10 20 20\n4\n20 20 30 30", expectedOutput: "20" },
      { input: "1\n5\n1\n5", expectedOutput: "5" },
      { input: "2\n100 200\n2\n300 400", expectedOutput: "None" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\na = list(map(int, input().split()))\nm = int(input())\nb = list(map(int, input().split()))\nresult = sorted(set(a) & set(b))\nif result:\n    print(' '.join(map(str, result)))\nelse:\n    print("None")`,
    evaluationType: "python"
  },
  {
    id: 149,
    title: "Sum of Squares",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given n integers, compute the sum of their squares.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the sum of the squares of the n integers.",
    constraints: "1 <= n <= 1000\n-1000 <= each element <= 1000",
    sampleTestCases: [
      { input: "3\n1 2 3", expectedOutput: "14", explanation: "1^2 + 2^2 + 3^2 = 1 + 4 + 9 = 14" },
      { input: "4\n2 3 4 5", expectedOutput: "54" }
    ],
    hiddenTestCases: [
      { input: "1\n0", expectedOutput: "0" },
      { input: "1\n5", expectedOutput: "25" },
      { input: "5\n1 1 1 1 1", expectedOutput: "5" },
      { input: "3\n-1 -2 -3", expectedOutput: "14" },
      { input: "2\n10 10", expectedOutput: "200" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nprint(sum(x * x for x in nums))`,
    evaluationType: "python"
  },
  {
    id: 150,
    title: "Pattern Print",
    section: "Python Coding",
    difficulty: "Easy",
    points: 10,
    timeLimit: 10000,
    description: "Given an integer n, print a right triangle star pattern with n rows. Row i (1-indexed) has i stars.",
    inputFormat: "A single integer n.",
    outputFormat: "Print n rows where row i contains i '*' characters separated by spaces.",
    constraints: "1 <= n <= 20",
    sampleTestCases: [
      { input: "3", expectedOutput: "*\n* *\n* * *", explanation: "Row 1: 1 star, Row 2: 2 stars, Row 3: 3 stars." },
      { input: "1", expectedOutput: "*" }
    ],
    hiddenTestCases: [
      { input: "2", expectedOutput: "*\n* *" },
      { input: "4", expectedOutput: "*\n* *\n* * *\n* * * *" },
      { input: "5", expectedOutput: "*\n* *\n* * *\n* * * *\n* * * * *" },
      { input: "6", expectedOutput: "*\n* *\n* * *\n* * * *\n* * * * *\n* * * * * *" },
      { input: "7", expectedOutput: "*\n* *\n* * *\n* * * *\n* * * * *\n* * * * * *\n* * * * * * *" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nfor i in range(1, n + 1):\n    print(' '.join(['*'] * i))`,
    evaluationType: "python"
  },
  {
    id: 151,
    title: "Binary Search",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a sorted array of n integers and a target value, find the index of the target using binary search. If the target is not found, print -1. Use 0-based indexing.",
    inputFormat: "First line contains two integers n and target. Second line contains n space-separated sorted integers.",
    outputFormat: "Print the 0-based index of target in the array, or -1 if not found.",
    constraints: "1 <= n <= 10^5\n-10^9 <= each element, target <= 10^9",
    sampleTestCases: [
      { input: "5 3\n1 2 3 4 5", expectedOutput: "2", explanation: "The element 3 is at index 2." },
      { input: "4 6\n1 3 5 7", expectedOutput: "-1", explanation: "6 is not present in the array." }
    ],
    hiddenTestCases: [
      { input: "1 1\n1", expectedOutput: "0" },
      { input: "6 7\n2 4 6 7 8 10", expectedOutput: "3" },
      { input: "5 1\n1 2 3 4 5", expectedOutput: "0" },
      { input: "5 5\n1 2 3 4 5", expectedOutput: "4" },
      { input: "3 10\n1 2 3", expectedOutput: "-1" }
    ],
    starterCode: `# Read input\n`,
    solution: `n, target = map(int, input().split())\narr = list(map(int, input().split()))\nlo, hi = 0, n - 1\nresult = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if arr[mid] == target:\n        result = mid\n        break\n    elif arr[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(result)`,
    evaluationType: "python"
  },
  {
    id: 152,
    title: "Matrix Multiplication",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given two matrices A (of size r1 x c1) and B (of size r2 x c2), compute their product A * B. It is guaranteed that c1 == r2.",
    inputFormat: "First line contains r1 and c1. Next r1 lines each contain c1 integers (matrix A). Next line contains r2 and c2. Next r2 lines each contain c2 integers (matrix B).",
    outputFormat: "Print the resulting matrix (r1 x c2), each row on a separate line with elements separated by spaces.",
    constraints: "1 <= r1, c1, r2, c2 <= 50\n-100 <= each element <= 100\nc1 == r2",
    sampleTestCases: [
      { input: "2 2\n1 2\n3 4\n2 2\n5 6\n7 8", expectedOutput: "19 22\n43 50", explanation: "Standard 2x2 matrix multiplication." },
      { input: "1 3\n1 2 3\n3 1\n4\n5\n6", expectedOutput: "32", explanation: "1*4 + 2*5 + 3*6 = 32." }
    ],
    hiddenTestCases: [
      { input: "2 3\n1 0 0\n0 1 0\n3 2\n1 2\n3 4\n5 6", expectedOutput: "1 2\n3 4" },
      { input: "1 1\n5\n1 1\n3", expectedOutput: "15" },
      { input: "2 2\n1 0\n0 1\n2 2\n9 8\n7 6", expectedOutput: "9 8\n7 6" },
      { input: "3 2\n1 2\n3 4\n5 6\n2 1\n7\n8", expectedOutput: "23\n53\n83" },
      { input: "2 2\n-1 2\n3 -4\n2 2\n5 -6\n-7 8", expectedOutput: "-19 22\n43 -50" }
    ],
    starterCode: `# Read input\n`,
    solution: `r1, c1 = map(int, input().split())\nA = [list(map(int, input().split())) for _ in range(r1)]\nr2, c2 = map(int, input().split())\nB = [list(map(int, input().split())) for _ in range(r2)]\nC = [[0]*c2 for _ in range(r1)]\nfor i in range(r1):\n    for j in range(c2):\n        for k in range(c1):\n            C[i][j] += A[i][k] * B[k][j]\nfor row in C:\n    print(' '.join(map(str, row)))`,
    evaluationType: "python"
  },
  {
    id: 153,
    title: "Valid Parentheses",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a string containing only the characters '(', ')', '{', '}', '[' and ']', determine if the input string has valid (balanced) parentheses. Print 'YES' if valid, 'NO' otherwise.",
    inputFormat: "A single line containing the string of brackets.",
    outputFormat: "Print YES if the parentheses are balanced, NO otherwise.",
    constraints: "1 <= len(s) <= 10^4",
    sampleTestCases: [
      { input: "()[]{}", expectedOutput: "YES", explanation: "All brackets are properly closed." },
      { input: "(]", expectedOutput: "NO", explanation: "( is not closed by ]." }
    ],
    hiddenTestCases: [
      { input: "{[]}", expectedOutput: "YES" },
      { input: "((()))", expectedOutput: "YES" },
      { input: "([)]", expectedOutput: "NO" },
      { input: "", expectedOutput: "YES" },
      { input: "((((", expectedOutput: "NO" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input().strip()\nstack = []\nmapping = {')': '(', ']': '[', '}': '{'}\nvalid = True\nfor c in s:\n    if c in '([{':\n        stack.append(c)\n    elif c in mapping:\n        if not stack or stack[-1] != mapping[c]:\n            valid = False\n            break\n        stack.pop()\nif stack:\n    valid = False\nprint('YES' if valid else 'NO')`,
    evaluationType: "python"
  },
  {
    id: 154,
    title: "Stack Implementation",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Implement a stack that supports the following operations: 'push x' (push x onto the stack), 'pop' (remove and print the top element; print -1 if empty), and 'peek' (print the top element without removing; print -1 if empty).",
    inputFormat: "First line contains n, the number of operations. Next n lines each contain an operation.",
    outputFormat: "For each pop or peek operation, print the result on a new line.",
    constraints: "1 <= n <= 1000\n-10^6 <= x <= 10^6",
    sampleTestCases: [
      { input: "5\npush 3\npush 5\npeek\npop\npeek", expectedOutput: "5\n5\n3", explanation: "After pushing 3 and 5, peek returns 5, pop removes 5, then peek returns 3." },
      { input: "3\npop\npush 10\npeek", expectedOutput: "-1\n10" }
    ],
    hiddenTestCases: [
      { input: "1\npop", expectedOutput: "-1" },
      { input: "4\npush 1\npush 2\npop\npop", expectedOutput: "2\n1" },
      { input: "6\npush 100\npeek\npush 200\npeek\npop\npop", expectedOutput: "100\n200\n200\n100" },
      { input: "3\npush 42\npop\npop", expectedOutput: "42\n-1" },
      { input: "5\npush -5\npush -10\npeek\npop\npeek", expectedOutput: "-10\n-10\n-5" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nstack = []\nfor _ in range(n):\n    op = input().split()\n    if op[0] == 'push':\n        stack.append(int(op[1]))\n    elif op[0] == 'pop':\n        print(stack.pop() if stack else -1)\n    elif op[0] == 'peek':\n        print(stack[-1] if stack else -1)`,
    evaluationType: "python"
  },
  {
    id: 155,
    title: "Queue Using Stacks",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Implement a queue using two stacks that supports the following operations: 'enqueue x' (add x to the queue), 'dequeue' (remove and print the front element; print -1 if empty), and 'front' (print the front element without removing; print -1 if empty).",
    inputFormat: "First line contains n, the number of operations. Next n lines each contain an operation.",
    outputFormat: "For each dequeue or front operation, print the result on a new line.",
    constraints: "1 <= n <= 1000\n-10^6 <= x <= 10^6",
    sampleTestCases: [
      { input: "5\nenqueue 1\nenqueue 2\nfront\ndequeue\nfront", expectedOutput: "1\n1\n2", explanation: "Front is 1, dequeue removes 1, then front is 2." },
      { input: "3\ndequeue\nenqueue 5\nfront", expectedOutput: "-1\n5" }
    ],
    hiddenTestCases: [
      { input: "1\ndequeue", expectedOutput: "-1" },
      { input: "4\nenqueue 10\nenqueue 20\ndequeue\ndequeue", expectedOutput: "10\n20" },
      { input: "6\nenqueue 3\nenqueue 6\nenqueue 9\ndequeue\ndequeue\nfront", expectedOutput: "3\n6\n9" },
      { input: "3\nenqueue 42\ndequeue\ndequeue", expectedOutput: "42\n-1" },
      { input: "5\nenqueue 1\ndequeue\nenqueue 2\nenqueue 3\nfront", expectedOutput: "1\n2" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\ns1 = []\ns2 = []\nfor _ in range(n):\n    op = input().split()\n    if op[0] == 'enqueue':\n        s1.append(int(op[1]))\n    elif op[0] == 'dequeue':\n        if not s2:\n            while s1:\n                s2.append(s1.pop())\n        print(s2.pop() if s2 else -1)\n    elif op[0] == 'front':\n        if not s2:\n            while s1:\n                s2.append(s1.pop())\n        print(s2[-1] if s2 else -1)`,
    evaluationType: "python"
  },
  {
    id: 156,
    title: "Spiral Matrix",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an m x n matrix, print all elements in spiral order (right, down, left, up, repeat).",
    inputFormat: "First line contains two integers m and n. Next m lines each contain n space-separated integers.",
    outputFormat: "Print all elements in spiral order, separated by spaces, on a single line.",
    constraints: "1 <= m, n <= 100\n-1000 <= each element <= 1000",
    sampleTestCases: [
      { input: "3 3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "1 2 3 6 9 8 7 4 5", explanation: "Spiral: right across top, down right col, left across bottom, up left col, then center." },
      { input: "2 3\n1 2 3\n4 5 6", expectedOutput: "1 2 3 6 5 4" }
    ],
    hiddenTestCases: [
      { input: "1 4\n1 2 3 4", expectedOutput: "1 2 3 4" },
      { input: "4 1\n1\n2\n3\n4", expectedOutput: "1 2 3 4" },
      { input: "1 1\n5", expectedOutput: "5" },
      { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", expectedOutput: "1 2 3 4 8 12 11 10 9 5 6 7" },
      { input: "2 2\n1 2\n3 4", expectedOutput: "1 2 4 3" }
    ],
    starterCode: `# Read input\n`,
    solution: `m, n = map(int, input().split())\nmatrix = [list(map(int, input().split())) for _ in range(m)]\nresult = []\ntop, bottom, left, right = 0, m - 1, 0, n - 1\nwhile top <= bottom and left <= right:\n    for j in range(left, right + 1):\n        result.append(matrix[top][j])\n    top += 1\n    for i in range(top, bottom + 1):\n        result.append(matrix[i][right])\n    right -= 1\n    if top <= bottom:\n        for j in range(right, left - 1, -1):\n            result.append(matrix[bottom][j])\n        bottom -= 1\n    if left <= right:\n        for i in range(bottom, top - 1, -1):\n            result.append(matrix[i][left])\n        left += 1\nprint(' '.join(map(str, result)))`,
    evaluationType: "python"
  },
  {
    id: 157,
    title: "Rotate Matrix 90",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an N x N matrix, rotate it 90 degrees clockwise and print the result.",
    inputFormat: "First line contains integer N. Next N lines each contain N space-separated integers.",
    outputFormat: "Print the rotated matrix, each row on a separate line with elements separated by spaces.",
    constraints: "1 <= N <= 100\n-1000 <= each element <= 1000",
    sampleTestCases: [
      { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "7 4 1\n8 5 2\n9 6 3", explanation: "90-degree clockwise rotation." },
      { input: "2\n1 2\n3 4", expectedOutput: "3 1\n4 2" }
    ],
    hiddenTestCases: [
      { input: "1\n5", expectedOutput: "5" },
      { input: "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16", expectedOutput: "13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4" },
      { input: "3\n0 0 0\n0 1 0\n0 0 0", expectedOutput: "0 0 0\n0 1 0\n0 0 0" },
      { input: "2\n-1 -2\n-3 -4", expectedOutput: "-3 -1\n-4 -2" },
      { input: "3\n1 0 0\n0 0 0\n0 0 2", expectedOutput: "0 0 1\n0 0 0\n2 0 0" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nmatrix = [list(map(int, input().split())) for _ in range(n)]\nrotated = [[matrix[n - 1 - j][i] for j in range(n)] for i in range(n)]\nfor row in rotated:\n    print(' '.join(map(str, row)))`,
    evaluationType: "python"
  },
  {
    id: 158,
    title: "Longest Common Prefix",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given n strings, find the longest common prefix among all strings. If there is no common prefix, print an empty line.",
    inputFormat: "First line contains an integer n. Next n lines each contain a string.",
    outputFormat: "Print the longest common prefix. If none, print an empty line.",
    constraints: "1 <= n <= 100\n1 <= len(each string) <= 200",
    sampleTestCases: [
      { input: "3\nflower\nflow\nflight", expectedOutput: "fl", explanation: "The longest common prefix is 'fl'." },
      { input: "3\ndog\nracecar\ncar", expectedOutput: "", explanation: "No common prefix." }
    ],
    hiddenTestCases: [
      { input: "1\nhello", expectedOutput: "hello" },
      { input: "2\nabc\nabc", expectedOutput: "abc" },
      { input: "3\ninterstellar\ninternet\ninternal", expectedOutput: "inter" },
      { input: "2\na\nb", expectedOutput: "" },
      { input: "4\nprefix\npre\nprevent\npreschool", expectedOutput: "pre" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nstrs = [input() for _ in range(n)]\nif not strs:\n    print('')\nelse:\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix:\n                break\n    print(prefix)`,
    evaluationType: "python"
  },
  {
    id: 159,
    title: "Group Anagrams",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given n words, group the anagrams together. Print each group on a separate line with words sorted alphabetically within each group and separated by spaces. Groups should be printed in the order of first appearance.",
    inputFormat: "First line contains an integer n. Next n lines each contain a single lowercase word.",
    outputFormat: "Print each group of anagrams on a separate line, words sorted alphabetically and separated by spaces.",
    constraints: "1 <= n <= 100\n1 <= len(each word) <= 50",
    sampleTestCases: [
      { input: "6\neat\ntea\ntan\nate\nnat\nbat", expectedOutput: "ate eat tea\nnat tan\nbat", explanation: "eat, tea, ate are anagrams; tan, nat are anagrams; bat has no anagram." },
      { input: "3\nabc\ncba\nbca", expectedOutput: "abc bca cba" }
    ],
    hiddenTestCases: [
      { input: "1\nhello", expectedOutput: "hello" },
      { input: "4\nlisten\nsilent\nenlist\ntinsel", expectedOutput: "enlist listen silent tinsel" },
      { input: "5\na\nb\nc\na\nb", expectedOutput: "a a\nb b\nc" },
      { input: "3\nxyz\nabc\ndef", expectedOutput: "xyz\nabc\ndef" },
      { input: "4\ntar\nrat\nart\ncar", expectedOutput: "art rat tar\ncar" }
    ],
    starterCode: `# Read input\n`,
    solution: `from collections import OrderedDict\nn = int(input())\ngroups = OrderedDict()\nfor _ in range(n):\n    word = input().strip()\n    key = ''.join(sorted(word))\n    if key not in groups:\n        groups[key] = []\n    groups[key].append(word)\nfor key in groups:\n    print(' '.join(sorted(groups[key])))`,
    evaluationType: "python"
  },
  {
    id: 160,
    title: "Maximum Subarray Sum",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an array of n integers, find the contiguous subarray with the largest sum using Kadane's algorithm and print that sum.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the maximum subarray sum.",
    constraints: "1 <= n <= 10^5\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "8\n-2 1 -3 4 -1 2 1 -5", expectedOutput: "6", explanation: "The subarray [4, -1, 2, 1] has the largest sum = 6." },
      { input: "5\n-1 -2 -3 -4 -5", expectedOutput: "-1", explanation: "The maximum subarray is [-1]." }
    ],
    hiddenTestCases: [
      { input: "1\n5", expectedOutput: "5" },
      { input: "3\n1 2 3", expectedOutput: "6" },
      { input: "6\n-2 -3 4 -1 -2 1", expectedOutput: "4" },
      { input: "4\n-1 2 3 -5", expectedOutput: "5" },
      { input: "5\n10 -3 4 -2 5", expectedOutput: "14" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\narr = list(map(int, input().split()))\nmax_sum = cur_sum = arr[0]\nfor i in range(1, n):\n    cur_sum = max(arr[i], cur_sum + arr[i])\n    max_sum = max(max_sum, cur_sum)\nprint(max_sum)`,
    evaluationType: "python"
  },
  {
    id: 161,
    title: "Product Except Self",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an array of n integers, compute an array where each element at index i is the product of all elements in the original array except the one at index i. Do not use division.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the resulting array as space-separated integers.",
    constraints: "2 <= n <= 10^5\n-100 <= each element <= 100",
    sampleTestCases: [
      { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6", explanation: "Product except self: [2*3*4, 1*3*4, 1*2*4, 1*2*3]." },
      { input: "3\n2 3 4", expectedOutput: "12 8 6" }
    ],
    hiddenTestCases: [
      { input: "2\n5 6", expectedOutput: "6 5" },
      { input: "4\n0 1 2 3", expectedOutput: "6 0 0 0" },
      { input: "5\n1 1 1 1 1", expectedOutput: "1 1 1 1 1" },
      { input: "3\n-1 2 -3", expectedOutput: "-6 3 -2" },
      { input: "4\n0 0 2 3", expectedOutput: "0 0 0 0" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\narr = list(map(int, input().split()))\nresult = [1] * n\nleft = 1\nfor i in range(n):\n    result[i] = left\n    left *= arr[i]\nright = 1\nfor i in range(n - 1, -1, -1):\n    result[i] *= right\n    right *= arr[i]\nprint(' '.join(map(str, result)))`,
    evaluationType: "python"
  },
  {
    id: 162,
    title: "Merge Intervals",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given n intervals represented as pairs of start and end values, merge all overlapping intervals and print the result.",
    inputFormat: "First line contains an integer n. Next n lines each contain two space-separated integers representing start and end of an interval.",
    outputFormat: "Print each merged interval on a separate line as two space-separated integers (start end), sorted by start value.",
    constraints: "1 <= n <= 10^4\n0 <= start <= end <= 10^6",
    sampleTestCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "1 6\n8 10\n15 18", explanation: "[1,3] and [2,6] overlap so they merge into [1,6]." },
      { input: "2\n1 4\n4 5", expectedOutput: "1 5" }
    ],
    hiddenTestCases: [
      { input: "1\n1 5", expectedOutput: "1 5" },
      { input: "3\n1 10\n2 3\n4 5", expectedOutput: "1 10" },
      { input: "3\n1 2\n3 4\n5 6", expectedOutput: "1 2\n3 4\n5 6" },
      { input: "4\n6 8\n1 3\n2 4\n7 9", expectedOutput: "1 4\n6 9" },
      { input: "2\n0 0\n1 1", expectedOutput: "0 0\n1 1" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nintervals = []\nfor _ in range(n):\n    a, b = map(int, input().split())\n    intervals.append((a, b))\nintervals.sort()\nmerged = [intervals[0]]\nfor s, e in intervals[1:]:\n    if s <= merged[-1][1]:\n        merged[-1] = (merged[-1][0], max(merged[-1][1], e))\n    else:\n        merged.append((s, e))\nfor s, e in merged:\n    print(s, e)`,
    evaluationType: "python"
  },
  {
    id: 163,
    title: "Pascal's Triangle",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an integer n, generate the first n rows of Pascal's triangle.",
    inputFormat: "A single integer n.",
    outputFormat: "Print n rows. Each row's elements are separated by spaces.",
    constraints: "1 <= n <= 20",
    sampleTestCases: [
      { input: "4", expectedOutput: "1\n1 1\n1 2 1\n1 3 3 1", explanation: "First 4 rows of Pascal's triangle." },
      { input: "1", expectedOutput: "1" }
    ],
    hiddenTestCases: [
      { input: "2", expectedOutput: "1\n1 1" },
      { input: "5", expectedOutput: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1" },
      { input: "6", expectedOutput: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1" },
      { input: "3", expectedOutput: "1\n1 1\n1 2 1" },
      { input: "7", expectedOutput: "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1\n1 6 15 20 15 6 1" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\ntriangle = []\nfor i in range(n):\n    row = [1] * (i + 1)\n    for j in range(1, i):\n        row[j] = triangle[i-1][j-1] + triangle[i-1][j]\n    triangle.append(row)\n    print(' '.join(map(str, row)))`,
    evaluationType: "python"
  },
  {
    id: 164,
    title: "Sliding Window Maximum",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an array of n integers and a window size k, find the maximum element in each sliding window of size k as it moves from left to right.",
    inputFormat: "First line contains two integers n and k. Second line contains n space-separated integers.",
    outputFormat: "Print the maximum values for each window, separated by spaces.",
    constraints: "1 <= k <= n <= 10^5\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "8 3\n1 3 -1 -3 5 3 6 7", expectedOutput: "3 3 5 5 6 7", explanation: "Windows: [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7." },
      { input: "5 2\n1 2 3 4 5", expectedOutput: "2 3 4 5" }
    ],
    hiddenTestCases: [
      { input: "1 1\n42", expectedOutput: "42" },
      { input: "5 5\n5 4 3 2 1", expectedOutput: "5" },
      { input: "6 3\n-1 -2 -3 -4 -5 -6", expectedOutput: "-1 -2 -3 -4" },
      { input: "4 1\n10 20 30 40", expectedOutput: "10 20 30 40" },
      { input: "7 3\n1 3 2 4 6 3 8", expectedOutput: "3 4 6 6 8" }
    ],
    starterCode: `# Read input\n`,
    solution: `from collections import deque\nn, k = map(int, input().split())\narr = list(map(int, input().split()))\ndq = deque()\nresult = []\nfor i in range(n):\n    while dq and dq[0] < i - k + 1:\n        dq.popleft()\n    while dq and arr[dq[-1]] <= arr[i]:\n        dq.pop()\n    dq.append(i)\n    if i >= k - 1:\n        result.append(str(arr[dq[0]]))\nprint(' '.join(result))`,
    evaluationType: "python"
  },
  {
    id: 165,
    title: "Next Greater Element",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an array of n integers, for each element find the next greater element to its right. If no greater element exists, output -1 for that position.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print n space-separated integers representing the next greater element for each position.",
    constraints: "1 <= n <= 10^5\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "4\n4 5 2 25", expectedOutput: "5 25 25 -1", explanation: "Next greater for 4->5, 5->25, 2->25, 25->none." },
      { input: "3\n3 2 1", expectedOutput: "-1 -1 -1" }
    ],
    hiddenTestCases: [
      { input: "1\n10", expectedOutput: "-1" },
      { input: "5\n1 2 3 4 5", expectedOutput: "2 3 4 5 -1" },
      { input: "5\n5 4 3 2 1", expectedOutput: "-1 -1 -1 -1 -1" },
      { input: "6\n2 7 3 5 4 6", expectedOutput: "7 -1 5 6 6 -1" },
      { input: "4\n1 1 1 1", expectedOutput: "-1 -1 -1 -1" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\narr = list(map(int, input().split()))\nresult = [-1] * n\nstack = []\nfor i in range(n):\n    while stack and arr[stack[-1]] < arr[i]:\n        result[stack.pop()] = arr[i]\n    stack.append(i)\nprint(' '.join(map(str, result)))`,
    evaluationType: "python"
  },
  {
    id: 166,
    title: "Evaluate Postfix",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a postfix (Reverse Polish Notation) expression with single-digit operands and operators (+, -, *, /), evaluate it and print the integer result. Division should truncate towards zero.",
    inputFormat: "A single line containing the postfix expression with tokens separated by spaces.",
    outputFormat: "Print the integer result of the evaluation.",
    constraints: "The expression is always valid.\nOperands are single digits (0-9).\nOperators are +, -, *, /.\nNo division by zero.",
    sampleTestCases: [
      { input: "2 3 +", expectedOutput: "5", explanation: "2 + 3 = 5." },
      { input: "5 1 2 + 4 * + 3 -", expectedOutput: "14", explanation: "5 + ((1+2)*4) - 3 = 14." }
    ],
    hiddenTestCases: [
      { input: "3 4 *", expectedOutput: "12" },
      { input: "9 3 /", expectedOutput: "3" },
      { input: "5 3 -", expectedOutput: "2" },
      { input: "2 3 1 * + 9 -", expectedOutput: "-4" },
      { input: "7 2 / 3 +", expectedOutput: "6" }
    ],
    starterCode: `# Read input\n`,
    solution: `tokens = input().split()\nstack = []\nfor t in tokens:\n    if t in '+-*/':\n        b = stack.pop()\n        a = stack.pop()\n        if t == '+':\n            stack.append(a + b)\n        elif t == '-':\n            stack.append(a - b)\n        elif t == '*':\n            stack.append(a * b)\n        elif t == '/':\n            stack.append(int(a / b))\n    else:\n        stack.append(int(t))\nprint(stack[0])`,
    evaluationType: "python"
  },
  {
    id: 167,
    title: "Sort by Frequency",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an array of n integers, sort the elements by decreasing frequency. If two elements have the same frequency, the smaller element should come first.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the sorted array as space-separated integers.",
    constraints: "1 <= n <= 10^5\n-10^6 <= each element <= 10^6",
    sampleTestCases: [
      { input: "6\n1 1 2 2 2 3", expectedOutput: "2 2 2 1 1 3", explanation: "2 appears 3 times, 1 appears 2 times, 3 appears 1 time." },
      { input: "5\n5 5 4 4 3", expectedOutput: "4 4 5 5 3", explanation: "4 and 5 both appear 2 times; 4 < 5 so 4 comes first." }
    ],
    hiddenTestCases: [
      { input: "1\n7", expectedOutput: "7" },
      { input: "4\n3 3 3 3", expectedOutput: "3 3 3 3" },
      { input: "6\n1 2 3 4 5 6", expectedOutput: "1 2 3 4 5 6" },
      { input: "8\n4 4 2 2 1 1 3 3", expectedOutput: "1 1 2 2 3 3 4 4" },
      { input: "7\n-1 -1 -1 2 2 3 3", expectedOutput: "-1 -1 -1 2 2 3 3" }
    ],
    starterCode: `# Read input\n`,
    solution: `from collections import Counter\nn = int(input())\narr = list(map(int, input().split()))\nfreq = Counter(arr)\narr.sort(key=lambda x: (-freq[x], x))\nprint(' '.join(map(str, arr)))`,
    evaluationType: "python"
  },
  {
    id: 168,
    title: "Longest Palindromic Substring",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a string, find and print the longest palindromic substring. If there are multiple with the same length, print the one that appears first.",
    inputFormat: "A single line containing a string s (lowercase letters only).",
    outputFormat: "Print the longest palindromic substring.",
    constraints: "1 <= len(s) <= 1000",
    sampleTestCases: [
      { input: "babad", expectedOutput: "bab", explanation: "'bab' is a palindrome of length 3 (aba is also valid but bab appears first)." },
      { input: "cbbd", expectedOutput: "bb" }
    ],
    hiddenTestCases: [
      { input: "a", expectedOutput: "a" },
      { input: "racecar", expectedOutput: "racecar" },
      { input: "abcde", expectedOutput: "a" },
      { input: "aabbcc", expectedOutput: "aa" },
      { input: "abacaba", expectedOutput: "abacaba" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input().strip()\nn = len(s)\nif n == 0:\n    print('')\nelse:\n    start = 0\n    max_len = 1\n    def expand(l, r):\n        global start, max_len\n        while l >= 0 and r < n and s[l] == s[r]:\n            if r - l + 1 > max_len:\n                start = l\n                max_len = r - l + 1\n            l -= 1\n            r += 1\n    for i in range(n):\n        expand(i, i)\n        expand(i, i + 1)\n    print(s[start:start + max_len])`,
    evaluationType: "python"
  },
  {
    id: 169,
    title: "Matrix Diagonal Sum",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an N x N matrix, compute the sum of its primary diagonal and secondary diagonal elements. If N is odd, the center element should be counted only once.",
    inputFormat: "First line contains integer N. Next N lines each contain N space-separated integers.",
    outputFormat: "Print the sum of both diagonals.",
    constraints: "1 <= N <= 100\n-1000 <= each element <= 1000",
    sampleTestCases: [
      { input: "3\n1 2 3\n4 5 6\n7 8 9", expectedOutput: "25", explanation: "Primary: 1+5+9=15, Secondary: 3+5+7=15, center 5 counted once: 15+15-5=25." },
      { input: "2\n1 2\n3 4", expectedOutput: "10", explanation: "1+4+2+3=10." }
    ],
    hiddenTestCases: [
      { input: "1\n5", expectedOutput: "5" },
      { input: "4\n1 0 0 1\n0 1 1 0\n0 1 1 0\n1 0 0 1", expectedOutput: "8" },
      { input: "3\n0 0 0\n0 0 0\n0 0 0", expectedOutput: "0" },
      { input: "3\n-1 0 1\n0 2 0\n3 0 -3", expectedOutput: "1" },
      { input: "5\n1 0 0 0 1\n0 2 0 2 0\n0 0 3 0 0\n0 4 0 4 0\n5 0 0 0 5", expectedOutput: "27" }
    ],
    starterCode: `# Read input\n`,
    solution: `n = int(input())\nmatrix = [list(map(int, input().split())) for _ in range(n)]\ntotal = 0\nfor i in range(n):\n    total += matrix[i][i]\n    total += matrix[i][n - 1 - i]\nif n % 2 == 1:\n    total -= matrix[n // 2][n // 2]\nprint(total)`,
    evaluationType: "python"
  },
  {
    id: 170,
    title: "Zigzag Traversal",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a binary tree represented as a level-order array (with -1 for null nodes), print its zigzag (spiral) level order traversal. Odd levels go left-to-right, even levels go right-to-left (1-indexed).",
    inputFormat: "First line contains n, the number of elements. Second line contains n space-separated integers (-1 represents null).",
    outputFormat: "Print elements in zigzag order, each level on a new line with elements separated by spaces.",
    constraints: "1 <= n <= 1000\n-1000 <= each element <= 1000 (except -1 for null)",
    sampleTestCases: [
      { input: "7\n1 2 3 4 5 6 7", expectedOutput: "1\n3 2\n4 5 6 7", explanation: "Level 1: 1 (L-R), Level 2: 3,2 (R-L), Level 3: 4,5,6,7 (L-R)." },
      { input: "3\n1 2 3", expectedOutput: "1\n3 2" }
    ],
    hiddenTestCases: [
      { input: "1\n5", expectedOutput: "5" },
      { input: "5\n1 2 3 -1 4", expectedOutput: "1\n3 2\n4" },
      { input: "15\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15", expectedOutput: "1\n3 2\n4 5 6 7\n15 14 13 12 11 10 9 8" },
      { input: "7\n10 20 30 -1 -1 40 50", expectedOutput: "10\n30 20\n40 50" },
      { input: "3\n1 -1 2", expectedOutput: "1\n2" }
    ],
    starterCode: `# Read input\n`,
    solution: `from collections import deque\nn = int(input())\narr = list(map(int, input().split()))\nif n == 0:\n    exit()\nqueue = deque()\nqueue.append(0)\nlevel = 1\nwhile queue:\n    size = len(queue)\n    vals = []\n    for _ in range(size):\n        idx = queue.popleft()\n        if idx < n and arr[idx] != -1:\n            vals.append(arr[idx])\n            left = 2 * idx + 1\n            right = 2 * idx + 2\n            if left < n and arr[left] != -1:\n                queue.append(left)\n            if right < n and arr[right] != -1:\n                queue.append(right)\n    if vals:\n        if level % 2 == 0:\n            vals.reverse()\n        print(' '.join(map(str, vals)))\n    level += 1`,
    evaluationType: "python"
  },
  {
    id: 171,
    title: "Count Inversions",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given an array of n integers, count the number of inversions. An inversion is a pair (i, j) where i < j and arr[i] > arr[j].",
    inputFormat: "First line contains an integer n. Second line contains n space-separated integers.",
    outputFormat: "Print the number of inversions.",
    constraints: "1 <= n <= 10^5\n-10^9 <= each element <= 10^9",
    sampleTestCases: [
      { input: "5\n2 4 1 3 5", expectedOutput: "3", explanation: "Inversions: (2,1), (4,1), (4,3)." },
      { input: "3\n3 2 1", expectedOutput: "3" }
    ],
    hiddenTestCases: [
      { input: "1\n5", expectedOutput: "0" },
      { input: "4\n1 2 3 4", expectedOutput: "0" },
      { input: "4\n4 3 2 1", expectedOutput: "6" },
      { input: "5\n1 5 2 4 3", expectedOutput: "4" },
      { input: "6\n6 5 4 3 2 1", expectedOutput: "15" }
    ],
    starterCode: `# Read input\n`,
    solution: `import sys\ninput = sys.stdin.readline\ndef merge_count(arr):\n    if len(arr) <= 1:\n        return arr, 0\n    mid = len(arr) // 2\n    left, l_inv = merge_count(arr[:mid])\n    right, r_inv = merge_count(arr[mid:])\n    merged = []\n    inversions = l_inv + r_inv\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            merged.append(left[i])\n            i += 1\n        else:\n            merged.append(right[j])\n            inversions += len(left) - i\n            j += 1\n    merged.extend(left[i:])\n    merged.extend(right[j:])\n    return merged, inversions\nn = int(input())\narr = list(map(int, input().split()))\n_, ans = merge_count(arr)\nprint(ans)`,
    evaluationType: "python"
  },
  {
    id: 172,
    title: "String Permutations",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a string, print all unique permutations of the string in sorted (lexicographic) order, one per line.",
    inputFormat: "A single line containing a string s (lowercase letters only).",
    outputFormat: "Print each unique permutation on a new line in sorted order.",
    constraints: "1 <= len(s) <= 8",
    sampleTestCases: [
      { input: "abc", expectedOutput: "abc\nacb\nbac\nbca\ncab\ncba", explanation: "All 6 permutations in sorted order." },
      { input: "aa", expectedOutput: "aa", explanation: "Only one unique permutation." }
    ],
    hiddenTestCases: [
      { input: "a", expectedOutput: "a" },
      { input: "ab", expectedOutput: "ab\nba" },
      { input: "aab", expectedOutput: "aab\naba\nbaa" },
      { input: "cba", expectedOutput: "abc\nacb\nbac\nbca\ncab\ncba" },
      { input: "aba", expectedOutput: "aab\naba\nbaa" }
    ],
    starterCode: `# Read input\n`,
    solution: `from itertools import permutations\ns = input().strip()\nperms = sorted(set(permutations(s)))\nfor p in perms:\n    print(''.join(p))`,
    evaluationType: "python"
  },
  {
    id: 173,
    title: "Power Set",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a set of n distinct integers, generate all possible subsets (the power set). Print each subset sorted, one per line, with subsets ordered by size then lexicographically. Print an empty line for the empty subset.",
    inputFormat: "First line contains an integer n. Second line contains n space-separated distinct integers.",
    outputFormat: "Print each subset on a new line with elements separated by spaces. Print an empty line for the empty subset. Subsets are ordered by size, then lexicographically.",
    constraints: "0 <= n <= 10\n-100 <= each element <= 100",
    sampleTestCases: [
      { input: "3\n1 2 3", expectedOutput: "\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3", explanation: "All 8 subsets of {1,2,3} ordered by size then lexicographically." },
      { input: "1\n5", expectedOutput: "\n5" }
    ],
    hiddenTestCases: [
      { input: "0\n", expectedOutput: "" },
      { input: "2\n3 1", expectedOutput: "\n1\n3\n1 3" },
      { input: "2\n-1 2", expectedOutput: "\n-1\n2\n-1 2" },
      { input: "3\n3 1 2", expectedOutput: "\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3" },
      { input: "4\n1 2 3 4", expectedOutput: "\n1\n2\n3\n4\n1 2\n1 3\n1 4\n2 3\n2 4\n3 4\n1 2 3\n1 2 4\n1 3 4\n2 3 4\n1 2 3 4" }
    ],
    starterCode: `# Read input\n`,
    solution: `from itertools import combinations\nn = int(input())\nline = input().strip()\nif n == 0:\n    print('')\nelse:\n    nums = sorted(list(map(int, line.split())))\n    for size in range(n + 1):\n        for combo in combinations(nums, size):\n            print(' '.join(map(str, combo)))`,
    evaluationType: "python"
  },
  {
    id: 174,
    title: "Josephus Problem",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "There are n people standing in a circle numbered from 1 to n. Starting from person 1, every k-th person is eliminated until only one person remains. Find the position (1-indexed) of the survivor.",
    inputFormat: "A single line containing two integers n and k.",
    outputFormat: "Print the 1-indexed position of the last person standing.",
    constraints: "1 <= n <= 10^6\n1 <= k <= 10^6",
    sampleTestCases: [
      { input: "7 3", expectedOutput: "4", explanation: "With 7 people and every 3rd eliminated, person 4 survives." },
      { input: "5 2", expectedOutput: "3", explanation: "With 5 people and every 2nd eliminated, person 3 survives." }
    ],
    hiddenTestCases: [
      { input: "1 1", expectedOutput: "1" },
      { input: "6 1", expectedOutput: "6" },
      { input: "10 3", expectedOutput: "4" },
      { input: "3 2", expectedOutput: "3" },
      { input: "100 7", expectedOutput: "27" }
    ],
    starterCode: `# Read input\n`,
    solution: `n, k = map(int, input().split())\npos = 0\nfor i in range(2, n + 1):\n    pos = (pos + k) % i\nprint(pos + 1)`,
    evaluationType: "python"
  },
  {
    id: 175,
    title: "Caesar Cipher",
    section: "Python Coding",
    difficulty: "Medium",
    points: 20,
    timeLimit: 10000,
    description: "Given a string and a shift value k, encrypt the string using Caesar cipher. Shift each letter by k positions in the alphabet (wrapping around). Preserve case and leave non-alphabetic characters unchanged.",
    inputFormat: "First line contains the string s. Second line contains the integer k.",
    outputFormat: "Print the encrypted string.",
    constraints: "1 <= len(s) <= 1000\n0 <= k <= 100",
    sampleTestCases: [
      { input: "abc\n3", expectedOutput: "def", explanation: "Each letter shifted by 3: a->d, b->e, c->f." },
      { input: "Hello, World!\n5", expectedOutput: "Mjqqt, Btwqi!", explanation: "Letters shifted by 5, case preserved, non-alpha unchanged." }
    ],
    hiddenTestCases: [
      { input: "xyz\n3", expectedOutput: "abc" },
      { input: "ABC\n26", expectedOutput: "ABC" },
      { input: "Test 123\n0", expectedOutput: "Test 123" },
      { input: "ZzZz\n1", expectedOutput: "AaAa" },
      { input: "Attack at Dawn!\n13", expectedOutput: "Nggnpx ng Qnja!" }
    ],
    starterCode: `# Read input\n`,
    solution: `s = input()\nk = int(input())\nresult = []\nfor c in s:\n    if c.isalpha():\n        base = ord('A') if c.isupper() else ord('a')\n        result.append(chr((ord(c) - base + k) % 26 + base))\n    else:\n        result.append(c)\nprint(''.join(result))`,
    evaluationType: "python"
  }
,
  {
  "id": 176,
  "title": "0/1 Knapsack",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given N items, each with a weight and a value, and a knapsack with a maximum weight capacity W, determine the maximum total value that can be carried in the knapsack. Each item can either be included or excluded (0/1 property).",
  "inputFormat": "First line: two integers N and W (number of items and max capacity).\nNext N lines: two integers each, weight_i and value_i.",
  "outputFormat": "A single integer representing the maximum value achievable.",
  "constraints": "1 <= N <= 100\n1 <= W <= 1000\n1 <= weight_i <= W\n1 <= value_i <= 1000",
  "sampleTestCases": [
    {
      "input": "4 7\n1 1\n3 4\n4 5\n5 7",
      "expectedOutput": "9",
      "explanation": "Select items with weights 3 and 4 (values 4 and 5) for total value 9."
    },
    {
      "input": "3 50\n10 60\n20 100\n30 120",
      "expectedOutput": "220"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 5\n5 10",
      "expectedOutput": "10"
    },
    {
      "input": "2 3\n2 3\n2 4",
      "expectedOutput": "4"
    },
    {
      "input": "5 10\n2 6\n2 3\n6 5\n5 4\n4 6",
      "expectedOutput": "15"
    },
    {
      "input": "3 5\n3 10\n4 7\n2 5",
      "expectedOutput": "15"
    },
    {
      "input": "4 8\n2 3\n3 4\n4 5\n5 8",
      "expectedOutput": "12"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput = sys.stdin.read().split()\nidx = 0\nN = int(input[idx]); idx += 1\nW = int(input[idx]); idx += 1\nweights = []\nvalues = []\nfor _ in range(N):\n    w = int(input[idx]); idx += 1\n    v = int(input[idx]); idx += 1\n    weights.append(w)\n    values.append(v)\ndp = [0] * (W + 1)\nfor i in range(N):\n    for j in range(W, weights[i] - 1, -1):\n        dp[j] = max(dp[j], dp[j - weights[i]] + values[i])\nprint(dp[W])",
  "evaluationType": "python"
},
  {
  "id": 177,
  "title": "Longest Common Subsequence",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given two strings, find the length of their longest common subsequence (LCS). A subsequence is a sequence that can be derived from the string by deleting some or no characters without changing the order of the remaining characters.",
  "inputFormat": "First line: string s1.\nSecond line: string s2.",
  "outputFormat": "A single integer representing the length of the LCS.",
  "constraints": "1 <= len(s1), len(s2) <= 1000\nStrings contain only lowercase English letters.",
  "sampleTestCases": [
    {
      "input": "abcde\nace",
      "expectedOutput": "3",
      "explanation": "The LCS is 'ace' with length 3."
    },
    {
      "input": "abc\ndef",
      "expectedOutput": "0"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "abcdef\nabdf",
      "expectedOutput": "4"
    },
    {
      "input": "aaa\naa",
      "expectedOutput": "2"
    },
    {
      "input": "abcd\nabcd",
      "expectedOutput": "4"
    },
    {
      "input": "xyzw\nywxz",
      "expectedOutput": "2"
    },
    {
      "input": "programming\ngaming",
      "expectedOutput": "6"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "s1 = input().strip()\ns2 = input().strip()\nm, n = len(s1), len(s2)\ndp = [[0] * (n + 1) for _ in range(m + 1)]\nfor i in range(1, m + 1):\n    for j in range(1, n + 1):\n        if s1[i-1] == s2[j-1]:\n            dp[i][j] = dp[i-1][j-1] + 1\n        else:\n            dp[i][j] = max(dp[i-1][j], dp[i][j-1])\nprint(dp[m][n])",
  "evaluationType": "python"
},
  {
  "id": 178,
  "title": "Longest Increasing Subsequence",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given an array of integers, find the length of the longest strictly increasing subsequence.",
  "inputFormat": "First line: integer N (size of array).\nSecond line: N space-separated integers.",
  "outputFormat": "A single integer representing the length of the LIS.",
  "constraints": "1 <= N <= 10000\n-10^9 <= arr[i] <= 10^9",
  "sampleTestCases": [
    {
      "input": "6\n10 9 2 5 3 7",
      "expectedOutput": "3",
      "explanation": "One LIS is [2, 3, 7] with length 3."
    },
    {
      "input": "8\n0 1 0 3 2 3 4 5",
      "expectedOutput": "6"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1\n5",
      "expectedOutput": "1"
    },
    {
      "input": "5\n5 4 3 2 1",
      "expectedOutput": "1"
    },
    {
      "input": "5\n1 2 3 4 5",
      "expectedOutput": "5"
    },
    {
      "input": "7\n3 1 4 1 5 9 2",
      "expectedOutput": "4"
    },
    {
      "input": "9\n2 6 3 4 1 5 9 7 8",
      "expectedOutput": "6"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import bisect\nn = int(input())\narr = list(map(int, input().split()))\ntails = []\nfor x in arr:\n    pos = bisect.bisect_left(tails, x)\n    if pos == len(tails):\n        tails.append(x)\n    else:\n        tails[pos] = x\nprint(len(tails))",
  "evaluationType": "python"
},
  {
  "id": 179,
  "title": "Coin Change",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a set of coin denominations and a target amount, find the minimum number of coins needed to make that amount. If it is not possible to make the amount, return -1.",
  "inputFormat": "First line: two integers N and amount (number of coin types and target amount).\nSecond line: N space-separated integers representing coin denominations.",
  "outputFormat": "A single integer: the minimum number of coins, or -1 if not possible.",
  "constraints": "1 <= N <= 100\n1 <= amount <= 10000\n1 <= coin[i] <= 10000",
  "sampleTestCases": [
    {
      "input": "3 11\n1 5 6",
      "expectedOutput": "2",
      "explanation": "Use two coins: 5 + 6 = 11."
    },
    {
      "input": "1 3\n2",
      "expectedOutput": "-1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "3 0\n1 2 5",
      "expectedOutput": "0"
    },
    {
      "input": "3 15\n1 5 10",
      "expectedOutput": "2"
    },
    {
      "input": "2 7\n3 5",
      "expectedOutput": "-1"
    },
    {
      "input": "3 30\n1 5 10",
      "expectedOutput": "3"
    },
    {
      "input": "4 23\n1 5 10 25",
      "expectedOutput": "5"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\namount = int(input_data[idx]); idx += 1\ncoins = [int(input_data[idx + i]) for i in range(N)]\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor i in range(1, amount + 1):\n    for c in coins:\n        if c <= i and dp[i - c] + 1 < dp[i]:\n            dp[i] = dp[i - c] + 1\nprint(dp[amount] if dp[amount] != float('inf') else -1)",
  "evaluationType": "python"
},
  {
  "id": 180,
  "title": "Edit Distance",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given two strings, find the minimum number of operations (insert, delete, replace) required to convert one string into the other. This is also known as the Levenshtein distance.",
  "inputFormat": "First line: string s1.\nSecond line: string s2.",
  "outputFormat": "A single integer representing the edit distance.",
  "constraints": "0 <= len(s1), len(s2) <= 1000\nStrings contain only lowercase English letters.",
  "sampleTestCases": [
    {
      "input": "horse\nros",
      "expectedOutput": "3",
      "explanation": "horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e)."
    },
    {
      "input": "intention\nexecution",
      "expectedOutput": "5"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "abc\nabc",
      "expectedOutput": "0"
    },
    {
      "input": "\nabc",
      "expectedOutput": "3"
    },
    {
      "input": "kitten\nsitting",
      "expectedOutput": "3"
    },
    {
      "input": "saturday\nsunday",
      "expectedOutput": "3"
    },
    {
      "input": "abcdef\nazced",
      "expectedOutput": "3"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "s1 = input().strip()\ns2 = input().strip()\nm, n = len(s1), len(s2)\ndp = [[0] * (n + 1) for _ in range(m + 1)]\nfor i in range(m + 1):\n    dp[i][0] = i\nfor j in range(n + 1):\n    dp[0][j] = j\nfor i in range(1, m + 1):\n    for j in range(1, n + 1):\n        if s1[i-1] == s2[j-1]:\n            dp[i][j] = dp[i-1][j-1]\n        else:\n            dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\nprint(dp[m][n])",
  "evaluationType": "python"
},
  {
  "id": 181,
  "title": "BFS Shortest Path",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given an unweighted undirected graph with N nodes (1-indexed) and M edges, find the shortest path distance from a source node S to a target node T. If no path exists, return -1.",
  "inputFormat": "First line: four integers N, M, S, T.\nNext M lines: two integers u and v representing an edge.",
  "outputFormat": "A single integer: the shortest distance, or -1 if unreachable.",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000\n1 <= S, T <= N",
  "sampleTestCases": [
    {
      "input": "5 4 1 5\n1 2\n2 3\n3 4\n4 5",
      "expectedOutput": "4",
      "explanation": "Path: 1->2->3->4->5, distance 4."
    },
    {
      "input": "4 2 1 4\n1 2\n3 4",
      "expectedOutput": "-1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "3 3 1 3\n1 2\n2 3\n1 3",
      "expectedOutput": "1"
    },
    {
      "input": "1 0 1 1",
      "expectedOutput": "0"
    },
    {
      "input": "6 7 1 6\n1 2\n1 3\n2 4\n3 4\n4 5\n5 6\n3 6",
      "expectedOutput": "2"
    },
    {
      "input": "5 0 1 5",
      "expectedOutput": "-1"
    },
    {
      "input": "4 4 2 4\n1 2\n2 3\n3 4\n1 4",
      "expectedOutput": "2"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "from collections import deque\nimport sys\ninput = sys.stdin.read().split()\nidx = 0\nN = int(input[idx]); idx += 1\nM = int(input[idx]); idx += 1\nS = int(input[idx]); idx += 1\nT = int(input[idx]); idx += 1\nadj = [[] for _ in range(N + 1)]\nfor _ in range(M):\n    u = int(input[idx]); idx += 1\n    v = int(input[idx]); idx += 1\n    adj[u].append(v)\n    adj[v].append(u)\nif S == T:\n    print(0)\nelse:\n    dist = [-1] * (N + 1)\n    dist[S] = 0\n    q = deque([S])\n    while q:\n        node = q.popleft()\n        for nb in adj[node]:\n            if dist[nb] == -1:\n                dist[nb] = dist[node] + 1\n                if nb == T:\n                    print(dist[T])\n                    exit()\n                q.append(nb)\n    print(-1)",
  "evaluationType": "python"
},
  {
  "id": 182,
  "title": "DFS Connected Components",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given an undirected graph with N nodes (1-indexed) and M edges, find the number of connected components.",
  "inputFormat": "First line: two integers N and M.\nNext M lines: two integers u and v representing an edge.",
  "outputFormat": "A single integer representing the number of connected components.",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000",
  "sampleTestCases": [
    {
      "input": "5 3\n1 2\n2 3\n4 5",
      "expectedOutput": "2",
      "explanation": "Components: {1,2,3} and {4,5}."
    },
    {
      "input": "4 0",
      "expectedOutput": "4"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 0",
      "expectedOutput": "1"
    },
    {
      "input": "6 5\n1 2\n2 3\n3 4\n4 5\n5 6",
      "expectedOutput": "1"
    },
    {
      "input": "6 2\n1 2\n3 4",
      "expectedOutput": "4"
    },
    {
      "input": "3 3\n1 2\n2 3\n1 3",
      "expectedOutput": "1"
    },
    {
      "input": "7 3\n1 2\n3 4\n5 6",
      "expectedOutput": "4"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\nsys.setrecursionlimit(20000)\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nadj = [[] for _ in range(N + 1)]\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    adj[u].append(v)\n    adj[v].append(u)\nvisited = [False] * (N + 1)\ncount = 0\ndef dfs(node):\n    stack = [node]\n    while stack:\n        n = stack.pop()\n        for nb in adj[n]:\n            if not visited[nb]:\n                visited[nb] = True\n                stack.append(nb)\nfor i in range(1, N + 1):\n    if not visited[i]:\n        visited[i] = True\n        dfs(i)\n        count += 1\nprint(count)",
  "evaluationType": "python"
},
  {
  "id": 183,
  "title": "Topological Sort",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a Directed Acyclic Graph (DAG) with N nodes (0-indexed) and M edges, print a valid topological ordering of the nodes. If multiple valid orderings exist, print the lexicographically smallest one.",
  "inputFormat": "First line: two integers N and M.\nNext M lines: two integers u and v representing a directed edge from u to v.",
  "outputFormat": "A single line with N space-separated integers representing a valid topological order (lexicographically smallest).",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000\nThe graph is a DAG.",
  "sampleTestCases": [
    {
      "input": "4 4\n0 1\n0 2\n1 3\n2 3",
      "expectedOutput": "0 1 2 3",
      "explanation": "0 must come before 1,2; 1 and 2 must come before 3. Lexicographically smallest: 0 1 2 3."
    },
    {
      "input": "3 2\n2 0\n2 1",
      "expectedOutput": "2 0 1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 0",
      "expectedOutput": "0"
    },
    {
      "input": "3 0",
      "expectedOutput": "0 1 2"
    },
    {
      "input": "5 4\n4 0\n4 1\n3 0\n3 2",
      "expectedOutput": "3 4 0 1 2"
    },
    {
      "input": "6 6\n5 2\n5 0\n4 0\n4 1\n2 3\n3 1",
      "expectedOutput": "4 5 0 2 3 1"
    },
    {
      "input": "2 1\n1 0",
      "expectedOutput": "1 0"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import heapq, sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nadj = [[] for _ in range(N)]\nindegree = [0] * N\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    adj[u].append(v)\n    indegree[v] += 1\nheap = []\nfor i in range(N):\n    if indegree[i] == 0:\n        heapq.heappush(heap, i)\nresult = []\nwhile heap:\n    node = heapq.heappop(heap)\n    result.append(node)\n    for nb in adj[node]:\n        indegree[nb] -= 1\n        if indegree[nb] == 0:\n            heapq.heappush(heap, nb)\nprint(' '.join(map(str, result)))",
  "evaluationType": "python"
},
  {
  "id": 184,
  "title": "Dijkstra Shortest Path",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a weighted directed graph with N nodes (1-indexed) and M edges, find the shortest path distance from source node S to target node T using Dijkstra's algorithm. If no path exists, return -1.",
  "inputFormat": "First line: four integers N, M, S, T.\nNext M lines: three integers u, v, w representing a directed edge from u to v with weight w.",
  "outputFormat": "A single integer: the shortest distance from S to T, or -1 if unreachable.",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000\n1 <= w <= 10000\n1 <= S, T <= N",
  "sampleTestCases": [
    {
      "input": "5 6 1 5\n1 2 2\n1 3 4\n2 3 1\n2 4 7\n3 5 3\n4 5 1",
      "expectedOutput": "6",
      "explanation": "Shortest path: 1->2->3->5 with total weight 2+1+3=6."
    },
    {
      "input": "3 1 1 3\n1 2 5",
      "expectedOutput": "-1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 0 1 1",
      "expectedOutput": "0"
    },
    {
      "input": "4 5 1 4\n1 2 1\n2 3 2\n3 4 3\n1 3 10\n1 4 100",
      "expectedOutput": "6"
    },
    {
      "input": "3 3 1 3\n1 2 1\n2 3 1\n1 3 5",
      "expectedOutput": "2"
    },
    {
      "input": "4 4 1 4\n1 2 3\n2 4 5\n1 3 2\n3 4 4",
      "expectedOutput": "6"
    },
    {
      "input": "2 1 2 1\n1 2 5",
      "expectedOutput": "-1"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import heapq, sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nS = int(input_data[idx]); idx += 1\nT = int(input_data[idx]); idx += 1\nadj = [[] for _ in range(N + 1)]\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    w = int(input_data[idx]); idx += 1\n    adj[u].append((v, w))\nif S == T:\n    print(0)\nelse:\n    dist = [float('inf')] * (N + 1)\n    dist[S] = 0\n    pq = [(0, S)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]:\n            continue\n        if u == T:\n            break\n        for v, w in adj[u]:\n            nd = d + w\n            if nd < dist[v]:\n                dist[v] = nd\n                heapq.heappush(pq, (nd, v))\n    print(dist[T] if dist[T] != float('inf') else -1)",
  "evaluationType": "python"
},
  {
  "id": 185,
  "title": "Detect Cycle in Graph",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a directed graph with N nodes (0-indexed) and M edges, determine if the graph contains a cycle. Print 'Yes' if a cycle exists, 'No' otherwise.",
  "inputFormat": "First line: two integers N and M.\nNext M lines: two integers u and v representing a directed edge from u to v.",
  "outputFormat": "A single line: 'Yes' or 'No'.",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000",
  "sampleTestCases": [
    {
      "input": "4 4\n0 1\n1 2\n2 3\n3 1",
      "expectedOutput": "Yes",
      "explanation": "Cycle: 1 -> 2 -> 3 -> 1."
    },
    {
      "input": "3 2\n0 1\n1 2",
      "expectedOutput": "No"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 0",
      "expectedOutput": "No"
    },
    {
      "input": "1 1\n0 0",
      "expectedOutput": "Yes"
    },
    {
      "input": "5 5\n0 1\n1 2\n2 3\n3 4\n4 2",
      "expectedOutput": "Yes"
    },
    {
      "input": "4 4\n0 1\n0 2\n1 3\n2 3",
      "expectedOutput": "No"
    },
    {
      "input": "3 3\n0 1\n1 2\n2 0",
      "expectedOutput": "Yes"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nadj = [[] for _ in range(N)]\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    adj[u].append(v)\nWHITE, GRAY, BLACK = 0, 1, 2\ncolor = [WHITE] * N\ndef has_cycle():\n    for i in range(N):\n        if color[i] == WHITE:\n            stack = [(i, 0)]\n            color[i] = GRAY\n            while stack:\n                node, idx2 = stack[-1]\n                if idx2 < len(adj[node]):\n                    stack[-1] = (node, idx2 + 1)\n                    nb = adj[node][idx2]\n                    if color[nb] == GRAY:\n                        return True\n                    if color[nb] == WHITE:\n                        color[nb] = GRAY\n                        stack.append((nb, 0))\n                else:\n                    color[node] = BLACK\n                    stack.pop()\n    return False\nprint(\"Yes\" if has_cycle() else \"No\")",
  "evaluationType": "python"
},
  {
  "id": 186,
  "title": "N-Queens Count",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given an integer N, find the number of distinct solutions to the N-Queens problem. The N-Queens problem asks how many ways N queens can be placed on an NxN chessboard so that no two queens threaten each other.",
  "inputFormat": "A single integer N.",
  "outputFormat": "A single integer representing the number of solutions.",
  "constraints": "1 <= N <= 12",
  "sampleTestCases": [
    {
      "input": "4",
      "expectedOutput": "2",
      "explanation": "There are exactly 2 distinct solutions for the 4-Queens problem."
    },
    {
      "input": "1",
      "expectedOutput": "1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "2",
      "expectedOutput": "0"
    },
    {
      "input": "5",
      "expectedOutput": "10"
    },
    {
      "input": "6",
      "expectedOutput": "4"
    },
    {
      "input": "8",
      "expectedOutput": "92"
    },
    {
      "input": "10",
      "expectedOutput": "724"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "def solve_nqueens(n):\n    count = 0\n    cols = set()\n    diag1 = set()\n    diag2 = set()\n    def backtrack(row):\n        nonlocal count\n        if row == n:\n            count += 1\n            return\n        for col in range(n):\n            if col in cols or (row - col) in diag1 or (row + col) in diag2:\n                continue\n            cols.add(col)\n            diag1.add(row - col)\n            diag2.add(row + col)\n            backtrack(row + 1)\n            cols.remove(col)\n            diag1.remove(row - col)\n            diag2.remove(row + col)\n    backtrack(0)\n    return count\nn = int(input())\nprint(solve_nqueens(n))",
  "evaluationType": "python"
},
  {
  "id": 187,
  "title": "Subset Sum",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a set of N non-negative integers and a target sum S, determine if there is a subset whose elements sum to exactly S. Print 'Yes' or 'No'.",
  "inputFormat": "First line: two integers N and S.\nSecond line: N space-separated non-negative integers.",
  "outputFormat": "A single line: 'Yes' or 'No'.",
  "constraints": "1 <= N <= 200\n0 <= S <= 10000\n0 <= arr[i] <= 1000",
  "sampleTestCases": [
    {
      "input": "4 9\n3 34 4 12",
      "expectedOutput": "No",
      "explanation": "No subset sums to 9."
    },
    {
      "input": "4 9\n3 34 4 5",
      "expectedOutput": "Yes"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "3 0\n1 2 3",
      "expectedOutput": "Yes"
    },
    {
      "input": "5 10\n1 2 3 4 5",
      "expectedOutput": "Yes"
    },
    {
      "input": "3 7\n1 2 3",
      "expectedOutput": "No"
    },
    {
      "input": "1 5\n5",
      "expectedOutput": "Yes"
    },
    {
      "input": "4 11\n2 3 5 7",
      "expectedOutput": "No"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nS = int(input_data[idx]); idx += 1\narr = [int(input_data[idx + i]) for i in range(N)]\ndp = [False] * (S + 1)\ndp[0] = True\nfor num in arr:\n    for j in range(S, num - 1, -1):\n        if dp[j - num]:\n            dp[j] = True\nprint(\"Yes\" if dp[S] else \"No\")",
  "evaluationType": "python"
},
  {
  "id": 188,
  "title": "Rod Cutting",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a rod of length N and a price table where price[i] is the price for a rod piece of length i+1, determine the maximum revenue obtainable by cutting up the rod and selling the pieces.",
  "inputFormat": "First line: integer N (length of the rod).\nSecond line: N space-separated integers representing the price table.",
  "outputFormat": "A single integer representing the maximum revenue.",
  "constraints": "1 <= N <= 1000\n1 <= price[i] <= 10000",
  "sampleTestCases": [
    {
      "input": "8\n1 5 8 9 10 17 17 20",
      "expectedOutput": "22",
      "explanation": "Cut into pieces of length 2 and 6 for revenue 5+17=22."
    },
    {
      "input": "4\n2 5 7 8",
      "expectedOutput": "10"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1\n3",
      "expectedOutput": "3"
    },
    {
      "input": "5\n2 5 7 8 10",
      "expectedOutput": "12"
    },
    {
      "input": "3\n1 5 6",
      "expectedOutput": "7"
    },
    {
      "input": "6\n1 5 8 9 10 17",
      "expectedOutput": "17"
    },
    {
      "input": "4\n3 5 8 9",
      "expectedOutput": "12"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "n = int(input())\nprices = list(map(int, input().split()))\ndp = [0] * (n + 1)\nfor i in range(1, n + 1):\n    for j in range(1, i + 1):\n        dp[i] = max(dp[i], prices[j - 1] + dp[i - j])\nprint(dp[n])",
  "evaluationType": "python"
},
  {
  "id": 189,
  "title": "Matrix Chain Multiplication",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a sequence of matrices, find the minimum number of scalar multiplications needed to multiply the chain. Matrix i has dimensions p[i-1] x p[i].",
  "inputFormat": "First line: integer N (number of matrices).\nSecond line: N+1 space-separated integers representing the dimension array p.",
  "outputFormat": "A single integer representing the minimum number of multiplications.",
  "constraints": "1 <= N <= 200\n1 <= p[i] <= 500",
  "sampleTestCases": [
    {
      "input": "4\n40 20 30 10 30",
      "expectedOutput": "26000",
      "explanation": "Optimal parenthesization yields 26000 scalar multiplications."
    },
    {
      "input": "3\n10 20 30 40",
      "expectedOutput": "18000"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1\n10 20",
      "expectedOutput": "0"
    },
    {
      "input": "2\n10 20 30",
      "expectedOutput": "6000"
    },
    {
      "input": "3\n5 10 3 12",
      "expectedOutput": "330"
    },
    {
      "input": "4\n10 30 5 60 10",
      "expectedOutput": "9600"
    },
    {
      "input": "5\n30 35 15 5 10 20",
      "expectedOutput": "15125"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "n = int(input())\np = list(map(int, input().split()))\nif n == 1:\n    print(0)\nelse:\n    dp = [[0] * n for _ in range(n)]\n    for length in range(2, n + 1):\n        for i in range(n - length + 1):\n            j = i + length - 1\n            dp[i][j] = float('inf')\n            for k in range(i, j):\n                cost = dp[i][k] + dp[k+1][j] + p[i] * p[k+1] * p[j+1]\n                if cost < dp[i][j]:\n                    dp[i][j] = cost\n    print(dp[0][n-1])",
  "evaluationType": "python"
},
  {
  "id": 190,
  "title": "Word Break",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a string s and a dictionary of words, determine if s can be segmented into a space-separated sequence of one or more dictionary words. Print 'Yes' or 'No'.",
  "inputFormat": "First line: the string s.\nSecond line: integer N (number of words in dictionary).\nNext N lines: one word each.",
  "outputFormat": "A single line: 'Yes' or 'No'.",
  "constraints": "1 <= len(s) <= 300\n1 <= N <= 1000\n1 <= len(word) <= 100",
  "sampleTestCases": [
    {
      "input": "leetcode\n2\nleet\ncode",
      "expectedOutput": "Yes",
      "explanation": "'leetcode' can be segmented as 'leet code'."
    },
    {
      "input": "catsandog\n5\ncats\ndog\nsand\nand\ncat",
      "expectedOutput": "No"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "applepenapple\n2\napple\npen",
      "expectedOutput": "Yes"
    },
    {
      "input": "a\n1\na",
      "expectedOutput": "Yes"
    },
    {
      "input": "abcd\n2\nab\ncd",
      "expectedOutput": "Yes"
    },
    {
      "input": "cars\n2\ncar\nca",
      "expectedOutput": "No"
    },
    {
      "input": "aaaaaaa\n2\naaa\naaaa",
      "expectedOutput": "Yes"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "s = input().strip()\nn = int(input())\nword_set = set()\nfor _ in range(n):\n    word_set.add(input().strip())\nL = len(s)\ndp = [False] * (L + 1)\ndp[0] = True\nfor i in range(1, L + 1):\n    for j in range(i):\n        if dp[j] and s[j:i] in word_set:\n            dp[i] = True\n            break\nprint(\"Yes\" if dp[L] else \"No\")",
  "evaluationType": "python"
},
  {
  "id": 191,
  "title": "Minimum Spanning Tree",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given an undirected weighted connected graph with N nodes (1-indexed) and M edges, find the total weight of its Minimum Spanning Tree using Kruskal's algorithm.",
  "inputFormat": "First line: two integers N and M.\nNext M lines: three integers u, v, w representing an edge between u and v with weight w.",
  "outputFormat": "A single integer representing the total weight of the MST.",
  "constraints": "2 <= N <= 10000\n1 <= M <= 50000\n1 <= w <= 10000\nThe graph is connected.",
  "sampleTestCases": [
    {
      "input": "4 5\n1 2 10\n1 3 6\n1 4 5\n2 4 15\n3 4 4",
      "expectedOutput": "19",
      "explanation": "MST edges: (3,4,4), (1,4,5), (1,2,10) with total weight 19."
    },
    {
      "input": "3 3\n1 2 1\n2 3 2\n1 3 3",
      "expectedOutput": "3"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "2 1\n1 2 5",
      "expectedOutput": "5"
    },
    {
      "input": "4 6\n1 2 1\n1 3 5\n1 4 10\n2 3 2\n2 4 6\n3 4 3",
      "expectedOutput": "6"
    },
    {
      "input": "5 7\n1 2 2\n1 3 3\n2 3 1\n2 4 4\n3 5 5\n4 5 6\n3 4 2",
      "expectedOutput": "8"
    },
    {
      "input": "3 3\n1 2 10\n2 3 20\n1 3 15",
      "expectedOutput": "25"
    },
    {
      "input": "5 6\n1 2 3\n2 3 1\n3 4 4\n4 5 2\n5 1 6\n2 4 5",
      "expectedOutput": "10"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nedges = []\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    w = int(input_data[idx]); idx += 1\n    edges.append((w, u, v))\nedges.sort()\nparent = list(range(N + 1))\nrank = [0] * (N + 1)\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]\n        x = parent[x]\n    return x\ndef union(a, b):\n    ra, rb = find(a), find(b)\n    if ra == rb:\n        return False\n    if rank[ra] < rank[rb]:\n        ra, rb = rb, ra\n    parent[rb] = ra\n    if rank[ra] == rank[rb]:\n        rank[ra] += 1\n    return True\ntotal = 0\nfor w, u, v in edges:\n    if union(u, v):\n        total += w\nprint(total)",
  "evaluationType": "python"
},
  {
  "id": 192,
  "title": "Trie Operations",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Implement a Trie that supports insert and search operations. Given a sequence of operations, execute each and for each 'search' operation, print 'True' if the word exists in the trie, 'False' otherwise.",
  "inputFormat": "First line: integer Q (number of operations).\nNext Q lines: either 'insert word' or 'search word'.",
  "outputFormat": "For each search operation, print 'True' or 'False' on a separate line.",
  "constraints": "1 <= Q <= 10000\n1 <= len(word) <= 100\nWords contain only lowercase English letters.",
  "sampleTestCases": [
    {
      "input": "5\ninsert apple\ninsert app\nsearch apple\nsearch app\nsearch ap",
      "expectedOutput": "True\nTrue\nFalse",
      "explanation": "'apple' and 'app' were inserted; 'ap' was not."
    },
    {
      "input": "3\ninsert hello\nsearch hello\nsearch world",
      "expectedOutput": "True\nFalse"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "2\ninsert a\nsearch a",
      "expectedOutput": "True"
    },
    {
      "input": "4\ninsert cat\ninsert car\nsearch cat\nsearch ca",
      "expectedOutput": "True\nFalse"
    },
    {
      "input": "6\ninsert test\ninsert testing\nsearch test\nsearch testing\nsearch tes\nsearch testings",
      "expectedOutput": "True\nTrue\nFalse\nFalse"
    },
    {
      "input": "3\nsearch missing\ninsert missing\nsearch missing",
      "expectedOutput": "False\nTrue"
    },
    {
      "input": "5\ninsert abc\ninsert abd\ninsert abcd\nsearch abc\nsearch ab",
      "expectedOutput": "True\nFalse"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read\nlines = input_data().strip().split('\\n')\nQ = int(lines[0])\ntrie = {}\noutput = []\nfor i in range(1, Q + 1):\n    parts = lines[i].split()\n    op = parts[0]\n    word = parts[1]\n    if op == 'insert':\n        node = trie\n        for ch in word:\n            if ch not in node:\n                node[ch] = {}\n            node = node[ch]\n        node['#'] = True\n    else:\n        node = trie\n        found = True\n        for ch in word:\n            if ch not in node:\n                found = False\n                break\n            node = node[ch]\n        if found and '#' in node:\n            output.append('True')\n        else:\n            output.append('False')\nprint('\\n'.join(output))",
  "evaluationType": "python"
},
  {
  "id": 193,
  "title": "Rabin-Karp Pattern Search",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a text string and a pattern string, find all starting positions (0-indexed) where the pattern occurs in the text using the Rabin-Karp algorithm or any efficient method. Print the positions space-separated. If the pattern does not occur, print -1.",
  "inputFormat": "First line: the text string.\nSecond line: the pattern string.",
  "outputFormat": "Space-separated 0-indexed positions where pattern occurs, or -1 if none.",
  "constraints": "1 <= len(text) <= 100000\n1 <= len(pattern) <= len(text)\nStrings contain only lowercase English letters.",
  "sampleTestCases": [
    {
      "input": "abcabcabc\nabc",
      "expectedOutput": "0 3 6",
      "explanation": "'abc' occurs at positions 0, 3, and 6."
    },
    {
      "input": "hello\nworld",
      "expectedOutput": "-1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "aaaaaa\naa",
      "expectedOutput": "0 1 2 3 4"
    },
    {
      "input": "abcdef\nabcdef",
      "expectedOutput": "0"
    },
    {
      "input": "abababab\nab",
      "expectedOutput": "0 2 4 6"
    },
    {
      "input": "abcde\nf",
      "expectedOutput": "-1"
    },
    {
      "input": "aabaabaab\naab",
      "expectedOutput": "0 3 6"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "text = input().strip()\npattern = input().strip()\nn, m = len(text), len(pattern)\nMOD = (1 << 61) - 1\nBASE = 131\npositions = []\nif m > n:\n    print(-1)\nelse:\n    ph = 0\n    th = 0\n    power = 1\n    for i in range(m):\n        ph = (ph * BASE + ord(pattern[i])) % MOD\n        th = (th * BASE + ord(text[i])) % MOD\n        if i > 0:\n            power = (power * BASE) % MOD\n    for i in range(n - m + 1):\n        if th == ph and text[i:i+m] == pattern:\n            positions.append(i)\n        if i < n - m:\n            th = (th - ord(text[i]) * power % MOD + MOD) % MOD\n            th = (th * BASE + ord(text[i + m])) % MOD\n    if positions:\n        print(' '.join(map(str, positions)))\n    else:\n        print(-1)",
  "evaluationType": "python"
},
  {
  "id": 194,
  "title": "Huffman Encoding",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a string, generate Huffman codes for each distinct character. Print each character and its Huffman code in sorted order of the character. When building the Huffman tree, if two nodes have the same frequency, prioritize the one with the lexicographically smaller character (or the combined string of characters).",
  "inputFormat": "A single string s.",
  "outputFormat": "Each line contains a character and its Huffman code separated by a space, sorted by character. If only one unique character exists, its code is '0'.",
  "constraints": "1 <= len(s) <= 10000\nString contains only lowercase English letters.",
  "sampleTestCases": [
    {
      "input": "aabbc",
      "expectedOutput": "a 0\nb 10\nc 11",
      "explanation": "a:2, b:2, c:1. Huffman tree assigns shorter codes to more frequent characters."
    },
    {
      "input": "aaaa",
      "expectedOutput": "a 0"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "abc",
      "expectedOutput": "a 0\nb 10\nc 11"
    },
    {
      "input": "aabb",
      "expectedOutput": "a 0\nb 1"
    },
    {
      "input": "abcde",
      "expectedOutput": "a 00\nb 010\nc 011\nd 10\ne 11"
    },
    {
      "input": "aaabbc",
      "expectedOutput": "a 0\nb 10\nc 11"
    },
    {
      "input": "ab",
      "expectedOutput": "a 0\nb 1"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import heapq\nfrom collections import Counter\n\ns = input().strip()\nfreq = Counter(s)\nif len(freq) == 1:\n    ch = list(freq.keys())[0]\n    print(f\"{ch} 0\")\nelse:\n    heap = []\n    for ch, f in freq.items():\n        heapq.heappush(heap, (f, ch, {ch: ''}))\n    while len(heap) > 1:\n        f1, chars1, codes1 = heapq.heappop(heap)\n        f2, chars2, codes2 = heapq.heappop(heap)\n        merged = {}\n        for c in codes1:\n            merged[c] = '0' + codes1[c]\n        for c in codes2:\n            merged[c] = '1' + codes2[c]\n        combined_chars = ''.join(sorted(set(chars1 + chars2)))\n        heapq.heappush(heap, (f1 + f2, combined_chars, merged))\n    _, _, codes = heap[0]\n    for ch in sorted(codes.keys()):\n        print(f\"{ch} {codes[ch]}\")",
  "evaluationType": "python"
},
  {
  "id": 195,
  "title": "Activity Selection",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given N activities with start and finish times, find the maximum number of non-overlapping activities that can be selected. An activity (s, f) occupies time [s, f). Activities are non-overlapping if one finishes before or when the other starts.",
  "inputFormat": "First line: integer N.\nNext N lines: two integers start_i and finish_i.",
  "outputFormat": "A single integer representing the maximum number of non-overlapping activities.",
  "constraints": "1 <= N <= 100000\n0 <= start_i < finish_i <= 10^9",
  "sampleTestCases": [
    {
      "input": "6\n1 2\n3 4\n0 6\n5 7\n8 9\n5 9",
      "expectedOutput": "4",
      "explanation": "Select activities (1,2), (3,4), (5,7), (8,9) for 4 activities."
    },
    {
      "input": "3\n1 3\n2 5\n4 6",
      "expectedOutput": "2"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1\n0 1",
      "expectedOutput": "1"
    },
    {
      "input": "4\n1 2\n2 3\n3 4\n4 5",
      "expectedOutput": "4"
    },
    {
      "input": "3\n0 10\n1 5\n5 10",
      "expectedOutput": "2"
    },
    {
      "input": "5\n1 3\n2 4\n3 5\n4 6\n5 7",
      "expectedOutput": "3"
    },
    {
      "input": "2\n0 1000000000\n0 1",
      "expectedOutput": "1"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nactivities = []\nfor _ in range(N):\n    s = int(input_data[idx]); idx += 1\n    f = int(input_data[idx]); idx += 1\n    activities.append((f, s))\nactivities.sort()\ncount = 0\nlast_end = -1\nfor f, s in activities:\n    if s >= last_end:\n        count += 1\n        last_end = f\nprint(count)",
  "evaluationType": "python"
},
  {
  "id": 196,
  "title": "Fractional Knapsack",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given N items with weights and values, and a knapsack of capacity W, find the maximum total value by allowing fractional amounts of items. Print the result with exactly 2 decimal places.",
  "inputFormat": "First line: two integers N and W.\nNext N lines: two integers weight_i and value_i.",
  "outputFormat": "A single number representing the maximum value, formatted to exactly 2 decimal places.",
  "constraints": "1 <= N <= 100000\n1 <= W <= 10^9\n1 <= weight_i, value_i <= 10^9",
  "sampleTestCases": [
    {
      "input": "3 50\n10 60\n20 100\n30 120",
      "expectedOutput": "240.00",
      "explanation": "Take all of item 1 (60) and item 2 (100), plus 2/3 of item 3 (80) = 240."
    },
    {
      "input": "2 10\n5 50\n10 60",
      "expectedOutput": "80.00"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 100\n50 200",
      "expectedOutput": "200.00"
    },
    {
      "input": "3 20\n10 100\n5 40\n15 60",
      "expectedOutput": "160.00"
    },
    {
      "input": "2 15\n10 500\n20 400",
      "expectedOutput": "600.00"
    },
    {
      "input": "1 5\n10 100",
      "expectedOutput": "50.00"
    },
    {
      "input": "3 100\n10 10\n20 20\n30 30",
      "expectedOutput": "60.00"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nW = int(input_data[idx]); idx += 1\nitems = []\nfor _ in range(N):\n    w = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    items.append((v / w, w, v))\nitems.sort(reverse=True)\ntotal = 0.0\nremaining = W\nfor ratio, w, v in items:\n    if remaining <= 0:\n        break\n    if w <= remaining:\n        total += v\n        remaining -= w\n    else:\n        total += ratio * remaining\n        remaining = 0\nprint(f\"{total:.2f}\")",
  "evaluationType": "python"
},
  {
  "id": 197,
  "title": "Job Scheduling",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given N jobs, each with a deadline and profit, find the maximum profit that can be earned by scheduling jobs. Each job takes 1 unit of time and must be completed before or on its deadline. Only one job can be scheduled at a time.",
  "inputFormat": "First line: integer N.\nNext N lines: two integers deadline_i and profit_i.",
  "outputFormat": "A single integer representing the maximum profit.",
  "constraints": "1 <= N <= 10000\n1 <= deadline_i <= N\n1 <= profit_i <= 10000",
  "sampleTestCases": [
    {
      "input": "4\n4 20\n1 10\n1 40\n1 30",
      "expectedOutput": "60",
      "explanation": "Schedule job 3 at time 1 (profit 40) and job 1 at time 4 (profit 20), total=60."
    },
    {
      "input": "5\n2 100\n1 19\n2 27\n1 25\n3 15",
      "expectedOutput": "142"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1\n1 50",
      "expectedOutput": "50"
    },
    {
      "input": "3\n1 10\n1 20\n1 30",
      "expectedOutput": "30"
    },
    {
      "input": "4\n2 50\n2 40\n3 30\n3 20",
      "expectedOutput": "120"
    },
    {
      "input": "3\n3 35\n3 30\n3 25",
      "expectedOutput": "90"
    },
    {
      "input": "5\n1 5\n2 10\n3 15\n4 20\n5 25",
      "expectedOutput": "75"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\njobs = []\nfor _ in range(N):\n    d = int(input_data[idx]); idx += 1\n    p = int(input_data[idx]); idx += 1\n    jobs.append((p, d))\njobs.sort(reverse=True)\nmax_d = max(d for _, d in jobs) if jobs else 0\nslot = [False] * (max_d + 1)\ntotal = 0\nfor p, d in jobs:\n    for t in range(d, 0, -1):\n        if not slot[t]:\n            slot[t] = True\n            total += p\n            break\nprint(total)",
  "evaluationType": "python"
},
  {
  "id": 198,
  "title": "Bridges in Graph",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given an undirected graph with N nodes (0-indexed) and M edges, find all bridge edges. A bridge is an edge whose removal increases the number of connected components. Print the bridges sorted by their first node, then by second node (each bridge printed as 'u v' where u < v). If no bridges exist, print -1.",
  "inputFormat": "First line: two integers N and M.\nNext M lines: two integers u and v representing an edge.",
  "outputFormat": "Each bridge on a separate line as 'u v' (u < v), sorted. If none, print -1.",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000\nNo duplicate edges or self-loops.",
  "sampleTestCases": [
    {
      "input": "5 5\n0 1\n1 2\n2 0\n1 3\n3 4",
      "expectedOutput": "1 3\n3 4",
      "explanation": "Removing edge (1,3) or (3,4) disconnects the graph."
    },
    {
      "input": "3 3\n0 1\n1 2\n2 0",
      "expectedOutput": "-1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "2 1\n0 1",
      "expectedOutput": "0 1"
    },
    {
      "input": "4 3\n0 1\n1 2\n2 3",
      "expectedOutput": "0 1\n1 2\n2 3"
    },
    {
      "input": "4 4\n0 1\n1 2\n2 3\n3 0",
      "expectedOutput": "-1"
    },
    {
      "input": "6 7\n0 1\n1 2\n2 0\n1 3\n3 4\n4 5\n5 3",
      "expectedOutput": "1 3"
    },
    {
      "input": "7 7\n0 1\n1 2\n2 0\n3 4\n4 5\n5 6\n6 3",
      "expectedOutput": "-1"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\nsys.setrecursionlimit(20000)\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nadj = [[] for _ in range(N)]\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    adj[u].append(v)\n    adj[v].append(u)\ndisc = [-1] * N\nlow = [-1] * N\ntimer = [0]\nbridges = []\ndef dfs(u, parent):\n    disc[u] = low[u] = timer[0]\n    timer[0] += 1\n    for v in adj[u]:\n        if disc[v] == -1:\n            dfs(v, u)\n            low[u] = min(low[u], low[v])\n            if low[v] > disc[u]:\n                bridges.append((min(u, v), max(u, v)))\n        elif v != parent:\n            low[u] = min(low[u], disc[v])\nfor i in range(N):\n    if disc[i] == -1:\n        dfs(i, -1)\nif not bridges:\n    print(-1)\nelse:\n    bridges.sort()\n    for u, v in bridges:\n        print(u, v)",
  "evaluationType": "python"
},
  {
  "id": 199,
  "title": "Strongly Connected Components",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given a directed graph with N nodes (0-indexed) and M edges, find the number of Strongly Connected Components (SCCs) using Kosaraju's algorithm.",
  "inputFormat": "First line: two integers N and M.\nNext M lines: two integers u and v representing a directed edge from u to v.",
  "outputFormat": "A single integer representing the number of SCCs.",
  "constraints": "1 <= N <= 10000\n0 <= M <= 50000",
  "sampleTestCases": [
    {
      "input": "5 5\n0 1\n1 2\n2 0\n1 3\n3 4",
      "expectedOutput": "3",
      "explanation": "SCCs: {0,1,2}, {3}, {4}."
    },
    {
      "input": "4 4\n0 1\n1 2\n2 3\n3 0",
      "expectedOutput": "1"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "1 0",
      "expectedOutput": "1"
    },
    {
      "input": "3 0",
      "expectedOutput": "3"
    },
    {
      "input": "4 4\n0 1\n1 0\n2 3\n3 2",
      "expectedOutput": "2"
    },
    {
      "input": "6 7\n0 1\n1 2\n2 0\n3 4\n4 5\n5 3\n2 3",
      "expectedOutput": "2"
    },
    {
      "input": "5 4\n0 1\n1 2\n2 3\n3 4",
      "expectedOutput": "5"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\nsys.setrecursionlimit(20000)\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\nM = int(input_data[idx]); idx += 1\nadj = [[] for _ in range(N)]\nradj = [[] for _ in range(N)]\nfor _ in range(M):\n    u = int(input_data[idx]); idx += 1\n    v = int(input_data[idx]); idx += 1\n    adj[u].append(v)\n    radj[v].append(u)\nvisited = [False] * N\norder = []\ndef dfs1(u):\n    stack = [(u, 0)]\n    visited[u] = True\n    while stack:\n        node, idx2 = stack[-1]\n        if idx2 < len(adj[node]):\n            stack[-1] = (node, idx2 + 1)\n            nb = adj[node][idx2]\n            if not visited[nb]:\n                visited[nb] = True\n                stack.append((nb, 0))\n        else:\n            order.append(node)\n            stack.pop()\nfor i in range(N):\n    if not visited[i]:\n        dfs1(i)\nvisited = [False] * N\ncount = 0\ndef dfs2(u):\n    stack = [u]\n    visited[u] = True\n    while stack:\n        node = stack.pop()\n        for nb in radj[node]:\n            if not visited[nb]:\n                visited[nb] = True\n                stack.append(nb)\nfor node in reversed(order):\n    if not visited[node]:\n        dfs2(node)\n        count += 1\nprint(count)",
  "evaluationType": "python"
},
  {
  "id": 200,
  "title": "Convex Hull",
  "section": "Python Coding",
  "difficulty": "Hard",
  "points": 30,
  "timeLimit": 10000,
  "description": "Given N points in a 2D plane, find the convex hull and print the points on the hull in counter-clockwise order starting from the point with the lowest y-coordinate (and leftmost if tied). Use Graham scan.",
  "inputFormat": "First line: integer N.\nNext N lines: two integers x_i and y_i.",
  "outputFormat": "Each line contains two space-separated integers representing a hull point, in counter-clockwise order starting from the bottom-most point.",
  "constraints": "3 <= N <= 100000\n-10^9 <= x_i, y_i <= 10^9\nNo three points are collinear.\nAll points are distinct.",
  "sampleTestCases": [
    {
      "input": "5\n0 0\n1 1\n2 2\n0 2\n2 0",
      "expectedOutput": "0 0\n2 0\n2 2\n0 2",
      "explanation": "The convex hull has 4 points. Point (1,1) is interior."
    },
    {
      "input": "4\n0 0\n4 0\n4 4\n0 4",
      "expectedOutput": "0 0\n4 0\n4 4\n0 4"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "3\n0 0\n1 0\n0 1",
      "expectedOutput": "0 0\n1 0\n0 1"
    },
    {
      "input": "5\n0 0\n5 0\n5 5\n0 5\n2 2",
      "expectedOutput": "0 0\n5 0\n5 5\n0 5"
    },
    {
      "input": "6\n1 1\n2 0\n3 1\n3 3\n1 3\n0 2",
      "expectedOutput": "2 0\n3 1\n3 3\n1 3\n0 2\n1 1"
    },
    {
      "input": "4\n-1 -1\n1 -1\n1 1\n-1 1",
      "expectedOutput": "-1 -1\n1 -1\n1 1\n-1 1"
    },
    {
      "input": "5\n0 0\n10 0\n10 10\n0 10\n5 5",
      "expectedOutput": "0 0\n10 0\n10 10\n0 10"
    }
  ],
  "starterCode": "# Read input\n",
  "solution": "import sys\nimport math\n\ndef cross(O, A, B):\n    return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0])\n\ninput_data = sys.stdin.read().split()\nidx = 0\nN = int(input_data[idx]); idx += 1\npoints = []\nfor _ in range(N):\n    x = int(input_data[idx]); idx += 1\n    y = int(input_data[idx]); idx += 1\n    points.append((x, y))\n\n# Find bottom-most (then leftmost) point\nstart = min(range(N), key=lambda i: (points[i][1], points[i][0]))\npivot = points[start]\n\ndef angle_key(p):\n    return (math.atan2(p[1] - pivot[1], p[0] - pivot[0]),\n            (p[0] - pivot[0])**2 + (p[1] - pivot[1])**2)\n\nother = [p for p in points if p != pivot]\nother.sort(key=angle_key)\n\nhull = [pivot]\nfor p in other:\n    while len(hull) > 1 and cross(hull[-2], hull[-1], p) <= 0:\n        hull.pop()\n    hull.append(p)\n\nfor p in hull:\n    print(p[0], p[1])",
  "evaluationType": "python"
}
];

module.exports = pythonProblems;
