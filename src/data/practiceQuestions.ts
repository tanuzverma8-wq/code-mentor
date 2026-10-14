import { PracticeQuestion } from '../types/index.js';

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'pq-c-pointers',
    title: 'Swap Two Variables Using Pointers',
    difficulty: 'easy',
    topic: 'Pointers',
    language: 'c',
    problemStatement:
      'Write a C function `void swap(int *a, int *b)` that swaps the values of two integers using pointer dereferencing without returning anything.',
    starterCode: `#include <stdio.h>

void swap(int *a, int *b) {
    // TODO: Dereference pointers to swap the values
}

int main() {
    int x = 15, y = 30;
    printf("Before: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After:  x=%d, y=%d\\n", x, y);
    return 0;
}`,
    solutionCode: `#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 15, y = 30;
    swap(&x, &y);
    printf("%d %d\\n", x, y);
    return 0;
}`,
    constraints: [
      '-10^9 <= x, y <= 10^9',
      'Must use pointer parameters (pass-by-reference simulation in C)',
    ],
    sampleTestCases: [
      {
        input: 'x = 15, y = 30',
        output: 'x = 30, y = 15',
        explanation: 'Values at memory addresses of x and y are interchanged via temp variable.',
      },
      {
        input: 'x = -5, y = 5',
        output: 'x = 5, y = -5',
        explanation: 'Works for negative and positive values identically.',
      },
    ],
    hints: [
      'Remember that `a` and `b` hold memory addresses, while `*a` and `*b` access the actual integer values stored at those addresses.',
      'Declare a temporary variable `int temp = *a;` to hold the first value before overwriting it.',
    ],
    solutionExplanation:
      'In C, arguments are passed by value. If you pass regular integers, only local copies get swapped. Passing memory addresses (`&x`, `&y`) allows the function to dereference (`*a`) and modify the original caller stack frame variables.',
    quiz: [
      {
        id: 'q1-c-ptr',
        question: 'What happens if you define `void swap(int a, int b)` in C and call `swap(x, y)`?',
        options: [
          'The original variables x and y remain completely unchanged in main().',
          'A segmentation fault occurs at runtime.',
          'The compiler rejects the function call with an error.',
          'Both variables are set to 0.',
        ],
        correctIndex: 0,
        explanation:
          'Because C passes arguments by value, swap() modifies only its own local copies of a and b on its stack frame. The originals in main() are untouched.',
      },
      {
        id: 'q2-c-ptr',
        question: 'What does the unary operator `*` do when placed before a pointer variable name in an expression (e.g. `*ptr = 10;`)?',
        options: [
          'Multiplies the address by 10.',
          'Dereferences the pointer to access or modify the value stored at that address.',
          'Allocates dynamic memory on the heap.',
          'Frees the pointer memory.',
        ],
        correctIndex: 1,
        explanation:
          'Dereferencing (`*ptr`) retrieves or updates the actual memory value that `ptr` points to.',
      },
    ],
  },
  {
    id: 'pq-c-string-null',
    title: 'Calculate String Length Without strlen()',
    difficulty: 'easy',
    topic: 'Strings',
    language: 'c',
    problemStatement:
      'Implement your own version of strlen in C: `int my_strlen(const char *str)`. It should count characters until it encounters the null terminator `\\0`.',
    starterCode: `#include <stdio.h>

int my_strlen(const char *str) {
    int length = 0;
    // TODO: Traverse until null terminator '\\0'
    return length;
}

int main() {
    char greeting[] = "Hello CodeMentor!";
    printf("Length: %d\\n", my_strlen(greeting));
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int my_strlen(const char *str) {
    int length = 0;
    while (str[length] != '\\0') {
        length++;
    }
    return length;
}

int main() {
    printf("%d\\n", my_strlen("Hello"));
    return 0;
}`,
    constraints: [
      'Do not include <string.h> strlen function.',
      'Input string is null-terminated and maximum length is 1000 characters.',
    ],
    sampleTestCases: [
      {
        input: '"Code"',
        output: '4',
        explanation: 'Characters are C, o, d, e before the \\0 terminator.',
      },
      {
        input: '"" (empty string)',
        output: '0',
        explanation: 'First character str[0] is \\0, so length is 0.',
      },
    ],
    hints: [
      'In C, strings are null-terminated character arrays. The last byte is always `\\0` (ASCII 0).',
      'Use a `while (str[i] != \'\\0\')` loop and increment a counter on each step.',
    ],
    solutionExplanation:
      'C does not store a separate length integer with strings. String operations rely on the sentinel `\\0` character. Omitting the null terminator leads to buffer overruns.',
    quiz: [
      {
        id: 'q1-c-str',
        question: 'Why does C require a null terminator `\\0` at the end of string literals?',
        options: [
          'Because C strings are arrays of chars without built-in length metadata, so functions need a sentinel to know where the text ends.',
          'To encrypt strings in memory.',
          'To align char memory with 64-bit CPU cache lines.',
          'Because the operating system requires all text to end with a newline.',
        ],
        correctIndex: 0,
        explanation:
          'C character arrays have no runtime length field. The null byte (`\\0`) signals the termination of valid text in memory.',
      },
    ],
  },
  {
    id: 'pq-cpp-reverse-array',
    title: 'In-Place Array Reversal (Two Pointers)',
    difficulty: 'easy',
    topic: 'Arrays',
    language: 'cpp',
    problemStatement:
      'Given a std::vector<int>, reverse the array elements in-place with O(1) auxiliary space using the two-pointer technique.',
    starterCode: `#include <iostream>
#include <vector>

void reverseArray(std::vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    // TODO: Swap elements while left < right
}

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    reverseArray(nums);
    for (int n : nums) std::cout << n << " ";
    std::cout << std::endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <vector>

void reverseArray(std::vector<int>& arr) {
    int left = 0;
    int right = static_cast<int>(arr.size()) - 1;
    while (left < right) {
        std::swap(arr[left], arr[right]);
        left++;
        right--;
    }
}

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    reverseArray(nums);
    for (int n : nums) std::cout << n << " ";
    return 0;
}`,
    constraints: [
      '0 <= arr.size() <= 10^5',
      'Auxiliary Space: O(1)',
      'Time Complexity: O(N)',
    ],
    sampleTestCases: [
      {
        input: '[1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: '1 swaps with 5, 2 swaps with 4, 3 remains in center.',
      },
      {
        input: '[10, 20]',
        output: '[20, 10]',
        explanation: 'Two elements simply swap positions.',
      },
    ],
    hints: [
      'Initialize `left = 0` and `right = arr.size() - 1`.',
      'In each step of the loop, swap `arr[left]` and `arr[right]`, then increment `left` and decrement `right`.',
      'Stop when `left >= right`.',
    ],
    solutionExplanation:
      'The two-pointer technique avoids creating an auxiliary array of size N, reducing space complexity from O(N) to O(1) while completing in N/2 iterations.',
    quiz: [
      {
        id: 'q1-cpp-rev',
        question: 'What is the maximum number of swap operations needed to reverse an array of size N?',
        options: [
          'floor(N / 2)',
          'N',
          'N * (N - 1) / 2',
          'log2(N)',
        ],
        correctIndex: 0,
        explanation:
          'Each swap places two elements in their final mirrored positions, so exactly floor(N/2) swaps are needed.',
      },
    ],
  },
  {
    id: 'pq-cpp-stack-parentheses',
    title: 'Balanced Parentheses Using Stack',
    difficulty: 'medium',
    topic: 'Basic Data Structures',
    language: 'cpp',
    problemStatement:
      'Write a C++ function `bool isValid(const std::string& s)` that checks if a string containing characters `(`, `)`, `{`, `}`, `[`, `]` is valid and balanced using std::stack.',
    starterCode: `#include <iostream>
#include <stack>
#include <string>

bool isValid(const std::string& s) {
    std::stack<char> st;
    // TODO: Process opening and closing brackets
    return false;
}

int main() {
    std::cout << std::boolalpha;
    std::cout << isValid("{[()]}") << std::endl; // Should be true
    std::cout << isValid("{[(])}") << std::endl; // Should be false
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <stack>
#include <string>

bool isValid(const std::string& s) {
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
        }
    }
    return st.empty();
}

int main() {
    std::cout << std::boolalpha << isValid("{[()]}") << std::endl;
    return 0;
}`,
    constraints: [
      '1 <= s.length() <= 10^4',
      'String consists only of parentheses (), {}, []',
    ],
    sampleTestCases: [
      {
        input: '"()[]{}"',
        output: 'true',
        explanation: 'Every opening bracket is closed by its corresponding type in correct order.',
      },
      {
        input: '"(]"',
        output: 'false',
        explanation: 'Opening bracket ( is incorrectly closed by ].',
      },
    ],
    hints: [
      'Push every opening bracket onto the stack.',
      'When you see a closing bracket, first check if the stack is empty (if so, return false). Then check if `st.top()` matches.',
      'At the end of the string, the stack must be completely empty.',
    ],
    solutionExplanation:
      'Stacks exhibit Last-In-First-Out (LIFO) order. Because the most recently opened bracket must be the first one closed, a stack is the optimal data structure (O(N) time and space).',
    quiz: [
      {
        id: 'q1-cpp-stack',
        question: 'Why does the function check `return st.empty();` at the very end instead of simply `return true;`?',
        options: [
          'To detect unclosed opening brackets like "(((" where no closing bracket was encountered.',
          'To avoid stack memory leaks in C++.',
          'Because pop() does not delete elements.',
          'Because stack size is capped at 100.',
        ],
        correctIndex: 0,
        explanation:
          'If the string is "(((", no closing bracket triggers an error, but the brackets were never closed. If stack is not empty, it is invalid.',
      },
    ],
  },
  {
    id: 'pq-py-recursion-fib',
    title: 'Memoized Fibonacci (Recursion)',
    difficulty: 'medium',
    topic: 'Recursion',
    language: 'python',
    problemStatement:
      'Write a Python function `fib_memo(n, memo=None)` that computes the N-th Fibonacci number efficiently using recursion with memoization to prevent exponential call stack explosion.',
    starterCode: `def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    # TODO: Implement base cases and memo lookup
    return 0

print("Fib(10):", fib_memo(10))
print("Fib(40):", fib_memo(40))
`,
    solutionCode: `def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    if n in memo:
        return memo[n]
    if n <= 0:
        return 0
    if n == 1:
        return 1
    
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

print(fib_memo(10))
`,
    constraints: [
      '0 <= n <= 50',
      'Time complexity must be O(N), not O(2^N)',
    ],
    sampleTestCases: [
      {
        input: 'n = 6',
        output: '8',
        explanation: 'Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8.',
      },
      {
        input: 'n = 0',
        output: '0',
        explanation: 'Base case fib(0) = 0.',
      },
    ],
    hints: [
      'Notice why we write `if memo is None: memo = {}` instead of `memo={}` in the parameter list (avoids Python mutable default argument bug!).',
      'Before calculating, check `if n in memo: return memo[n]`.',
    ],
    solutionExplanation:
      'Standard naive recursive Fibonacci recalculates overlapping subproblems 2^N times. Memoization stores previously computed results in a dictionary, reducing time complexity to O(N).',
    quiz: [
      {
        id: 'q1-py-rec',
        question: 'What is the time complexity of naive Fibonacci `def fib(n): return fib(n-1) + fib(n-2)` without memoization?',
        options: [
          'O(2^N) exponential time',
          'O(N) linear time',
          'O(N^2) quadratic time',
          'O(log N) logarithmic time',
        ],
        correctIndex: 0,
        explanation:
          'Each call branches into two recursive calls, creating a binary recursion tree of depth N, which requires roughly 2^N operations.',
      },
      {
        id: 'q2-py-rec',
        question: 'Why should you avoid `def fib_memo(n, memo={})` as the function signature in Python?',
        options: [
          'Default arguments are evaluated once when the function is defined, causing state to leak across separate invocations.',
          'Python dictionaries cannot be default arguments.',
          'It causes a syntax error in Python 3.',
          'It disables garbage collection.',
        ],
        correctIndex: 0,
        explanation:
          'Python evaluates default parameter expressions once at definition time. Subsequent calls would share the exact same dictionary object.',
      },
    ],
  },
  {
    id: 'pq-c-loops-overflow',
    title: 'Integer Overflow in Loop Condition',
    difficulty: 'medium',
    topic: 'Loops',
    language: 'c',
    problemStatement:
      'Identify and fix the infinite loop caused by integer type bounds: `signed char i; for (i = 0; i <= 127; i++)` causes overflow when i increments past 127 in 8-bit signed integer.',
    starterCode: `#include <stdio.h>

void printRange() {
    // Problem: signed char has range -128 to +127.
    // When i is 127 and increments, it wraps around to -128!
    // TODO: Fix the variable type or loop condition
    signed char i;
    for (i = 0; i <= 127; i++) {
        // Will loop infinitely if i is signed char!
        if (i < 5) printf("%d ", i);
    }
}

int main() {
    printRange();
    printf("\\nFinished successfully!\\n");
    return 0;
}`,
    solutionCode: `#include <stdio.h>

void printRange() {
    int i; // Changed from signed char to int to prevent overflow at 127
    for (i = 0; i <= 127; i++) {
        if (i < 5) printf("%d ", i);
    }
}

int main() {
    printRange();
    printf("\\nFinished successfully!\\n");
    return 0;
}`,
    constraints: [
      'Loop must terminate cleanly.',
      'Understand two\'s complement signed integer limits.',
    ],
    sampleTestCases: [
      {
        input: 'Execute loop up to 127',
        output: '0 1 2 3 4 Finished successfully!',
        explanation: 'Loop finishes without wrapping around into negative numbers.',
      },
    ],
    hints: [
      'An 8-bit signed integer (`signed char`) can only represent values from -128 to 127.',
      'When `i = 127` and `i++` occurs, in two\'s complement signed representation it overflows to `-128`. Because `-128 <= 127` is true, the condition never becomes false!',
      'Change the variable type to standard `int`.',
    ],
    solutionExplanation:
      'Understanding fundamental data type limits in C is essential. Signed integer overflow in C is undefined behavior, while unsigned overflow wraps with modulo 2^N.',
    quiz: [
      {
        id: 'q1-c-overflow',
        question: 'What is the maximum positive value that a standard signed 8-bit integer (signed char) can store?',
        options: [
          '127',
          '255',
          '128',
          '65535',
        ],
        correctIndex: 0,
        explanation:
          'In two\'s complement with 8 bits, 1 bit is for sign and 7 bits for magnitude: 2^7 - 1 = 127.',
      },
    ],
  },
  {
    id: 'pq-py-dict-two-sum',
    title: 'Two Sum with Hash Map (O(N) Time)',
    difficulty: 'medium',
    topic: 'Variables and data types',
    language: 'python',
    problemStatement:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. Use a Python dictionary (hash map) to achieve O(N) linear time.',
    starterCode: `def two_sum(nums, target):
    seen = {} # Maps value -> index
    # TODO: Traverse nums and check if (target - num) is already in seen
    return []

print(two_sum([2, 7, 11, 15], 9)) # Should return [0, 1]
`,
    solutionCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
`,
    constraints: [
      '2 <= len(nums) <= 10^4',
      'Exactly one valid answer exists.',
      'Time complexity must be O(N)',
    ],
    sampleTestCases: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'nums[0] + nums[1] = 2 + 7 = 9.',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] = 2 + 4 = 6.',
      },
    ],
    hints: [
      'A brute force nested loop takes O(N^2) time.',
      'Instead, for each element, calculate `complement = target - num`.',
      'If the complement is in `seen`, you have found your pair in O(1) average lookup time!',
    ],
    solutionExplanation:
      'Python dictionaries use hash tables under the hood. Hash lookups are O(1) on average, bringing the total time down from O(N^2) to O(N).',
    quiz: [
      {
        id: 'q1-py-twosum',
        question: 'What is the average time complexity of checking `if key in dict:` in Python?',
        options: [
          'O(1) constant time',
          'O(N) linear time',
          'O(log N) logarithmic time',
          'O(N log N)',
        ],
        correctIndex: 0,
        explanation:
          'Python dictionaries use hash tables, giving average O(1) lookup and insertion time.',
      },
    ],
  },
  {
    id: 'pq-c-dyn-matrix',
    title: 'Dynamic 2D Array Allocation with malloc',
    difficulty: 'hard',
    topic: 'Pointers',
    language: 'c',
    problemStatement:
      'Allocate an `R` by `C` matrix dynamically in C using an array of pointers (`int**`), populate it with values, and free all dynamically allocated heap memory without memory leaks.',
    starterCode: `#include <stdio.h>
#include <stdlib.h>

int** allocateMatrix(int rows, int cols) {
    // TODO: Allocate array of pointer to rows
    // TODO: For each row, allocate cols integers
    return NULL;
}

void freeMatrix(int** matrix, int rows) {
    // TODO: Free each row, then free the top-level pointer array
}

int main() {
    int rows = 3, cols = 4;
    int **mat = allocateMatrix(rows, cols);
    // freeMatrix(mat, rows);
    return 0;
}`,
    solutionCode: `#include <stdio.h>
#include <stdlib.h>

int** allocateMatrix(int rows, int cols) {
    int** matrix = (int**)malloc(rows * sizeof(int*));
    if (!matrix) return NULL;
    for (int i = 0; i < rows; i++) {
        matrix[i] = (int*)malloc(cols * sizeof(int));
        if (!matrix[i]) {
            // Cleanup previously allocated rows
            for (int j = 0; j < i; j++) free(matrix[j]);
            free(matrix);
            return NULL;
        }
    }
    return matrix;
}

void freeMatrix(int** matrix, int rows) {
    if (!matrix) return;
    for (int i = 0; i < rows; i++) {
        free(matrix[i]);
    }
    free(matrix);
}

int main() {
    int **mat = allocateMatrix(3, 4);
    freeMatrix(mat, 3);
    printf("Allocated and freed cleanly.\\n");
    return 0;
}`,
    constraints: [
      '1 <= rows, cols <= 1000',
      'Check for NULL return values from malloc.',
      'Must free in reverse order of allocation to avoid dangling pointers.',
    ],
    sampleTestCases: [
      {
        input: 'rows = 3, cols = 4',
        output: 'Allocated and freed cleanly.',
        explanation: 'Dynamic 2D array allocated on heap and completely deallocated.',
      },
    ],
    hints: [
      'First allocate an array of pointer to ints: `int **matrix = malloc(rows * sizeof(int*));`',
      'Then loop through each row: `matrix[i] = malloc(cols * sizeof(int));`',
      'When freeing, free `matrix[i]` first for all rows, and lastly `free(matrix)`. If you free `matrix` first, you lose access to the row pointers!',
    ],
    solutionExplanation:
      'Dynamically allocating 2D arrays via pointer-to-pointer creates a jagged layout on the heap. Freeing must always be done inside-out.',
    quiz: [
      {
        id: 'q1-c-matrix',
        question: 'What happens if you execute `free(matrix);` BEFORE freeing each individual `matrix[i]` row pointer?',
        options: [
          'The pointers to individual rows are lost, causing heap memory leaks for all row allocations.',
          'The C runtime automatically cascades and frees all rows.',
          'The compiler throws a syntax error.',
          'All row data is copied to the stack.',
        ],
        correctIndex: 0,
        explanation:
          'Freeing the parent pointer array deallocates only the array of addresses. The memory blocks allocated for the rows remain on the heap with no remaining references, causing a memory leak.',
      },
    ],
  },
  {
    id: 'pq-c-bit-power-two',
    title: 'Check Power of Two with Bitwise AND',
    difficulty: 'easy',
    topic: 'Functions',
    language: 'c',
    problemStatement:
      'Implement `int isPowerOfTwo(int n)` in C in O(1) time using bitwise operations without loops or log() functions.',
    starterCode: `#include <stdio.h>

int isPowerOfTwo(int n) {
    // TODO: Return 1 if n is a power of two, otherwise 0
    return 0;
}

int main() {
    printf("16 is power of 2: %d\\n", isPowerOfTwo(16)); // 1
    printf("18 is power of 2: %d\\n", isPowerOfTwo(18)); // 0
    return 0;
}`,
    solutionCode: `#include <stdio.h>

int isPowerOfTwo(int n) {
    if (n <= 0) return 0;
    return (n & (n - 1)) == 0;
}

int main() {
    printf("%d %d\\n", isPowerOfTwo(16), isPowerOfTwo(18));
    return 0;
}`,
    constraints: [
      '-2^31 <= n <= 2^31 - 1',
      'O(1) time complexity.',
    ],
    sampleTestCases: [
      {
        input: 'n = 16 (binary 10000)',
        output: '1',
        explanation: '16 is 2^4. 16 & 15 (10000 & 01111) = 00000.',
      },
      {
        input: 'n = 0',
        output: '0',
        explanation: '0 is not a positive power of two.',
      },
    ],
    hints: [
      'Powers of two have exactly one bit set to 1 in binary (e.g. 8 is 1000, 16 is 10000).',
      'What happens when you subtract 1 from a power of two? (e.g. 16 - 1 = 15 is 01111 in binary).',
      'What is `n & (n - 1)`? Remember to check `n > 0`!',
    ],
    solutionExplanation:
      'Subtracting 1 flips the least significant set bit and all bits below it. For a power of two with only one set bit, `n & (n - 1)` produces zero.',
    quiz: [
      {
        id: 'q1-c-bits',
        question: 'Why is `if (n <= 0) return 0;` necessary before evaluating `(n & (n - 1)) == 0`?',
        options: [
          'Because for n = 0, (0 & -1) equals 0, which would falsely report 0 as a power of two.',
          'Bitwise AND is illegal on negative numbers in C.',
          'Negative numbers cause CPU hardware interrupts.',
          'The compiler converts 0 to NULL.',
        ],
        correctIndex: 0,
        explanation:
          '0 is not a power of 2, but 0 & -1 evaluates to 0. An explicit check `n > 0` is required.',
      },
    ],
  },
  {
    id: 'pq-cpp-recursion-tower-hanoi',
    title: 'Tower of Hanoi Moves Generator',
    difficulty: 'medium',
    topic: 'Recursion',
    language: 'cpp',
    problemStatement:
      'Implement `void solveHanoi(int n, char fromRod, char toRod, char auxRod)` in C++ to print the sequence of disk moves to transfer n disks from `fromRod` to `toRod` using `auxRod`.',
    starterCode: `#include <iostream>

void solveHanoi(int n, char fromRod, char toRod, char auxRod) {
    // TODO: Base case when n == 1
    // TODO: Recursive steps
}

int main() {
    int n = 3;
    solveHanoi(n, 'A', 'C', 'B');
    return 0;
}`,
    solutionCode: `#include <iostream>

void solveHanoi(int n, char fromRod, char toRod, char auxRod) {
    if (n == 0) return;
    if (n == 1) {
        std::cout << "Move disk 1 from " << fromRod << " to " << toRod << "\\n";
        return;
    }
    solveHanoi(n - 1, fromRod, auxRod, toRod);
    std::cout << "Move disk " << n << " from " << fromRod << " to " << toRod << "\\n";
    solveHanoi(n - 1, auxRod, toRod, fromRod);
}

int main() {
    solveHanoi(3, 'A', 'C', 'B');
    return 0;
}`,
    constraints: [
      '1 <= n <= 10',
      'Total moves = 2^n - 1',
    ],
    sampleTestCases: [
      {
        input: 'n = 2, from=A, to=C, aux=B',
        output: 'Move disk 1 from A to B\\nMove disk 2 from A to C\\nMove disk 1 from B to C',
        explanation: '3 moves total (2^2 - 1 = 3).',
      },
    ],
    hints: [
      'To move n disks from A to C: first move (n-1) disks from A to B using C.',
      'Then move disk n directly from A to C.',
      'Finally move the (n-1) disks from B to C using A.',
    ],
    solutionExplanation:
      'Tower of Hanoi is a classic divide-and-conquer recursion problem with recurrence relation T(n) = 2*T(n-1) + 1, resulting in 2^n - 1 total operations.',
    quiz: [
      {
        id: 'q1-cpp-hanoi',
        question: 'How many total disk moves are required to solve Tower of Hanoi for n = 4 disks?',
        options: [
          '15 moves',
          '16 moves',
          '8 moves',
          '24 moves',
        ],
        correctIndex: 0,
        explanation:
          'Formula is 2^n - 1. For n = 4: 2^4 - 1 = 16 - 1 = 15 moves.',
      },
    ],
  },
];
