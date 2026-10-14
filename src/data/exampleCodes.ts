import { SupportedLanguage } from '../types/index.js';

export interface CodeExample {
  id: string;
  title: string;
  language: SupportedLanguage;
  category: string;
  description: string;
  code: string;
  compilerError?: string;
  expectedBehavior?: string;
}

export const CODE_EXAMPLES: CodeExample[] = [
  {
    id: 'c-pointer-null',
    title: 'C: Uninitialized Pointer Dereference',
    language: 'c',
    category: 'Memory & Pointers',
    description: 'A classic beginner C mistake where a pointer is dereferenced before pointing to valid memory.',
    code: `#include <stdio.h>

int main() {
    int *ptr; // Uninitialized pointer pointing to garbage address
    printf("Enter a value: ");
    *ptr = 42; // Segmentation fault: dereferencing unallocated pointer
    printf("Value stored: %d\\n", *ptr);
    return 0;
}`,
    compilerError: 'Segmentation fault (core dumped)',
    expectedBehavior: 'Store 42 at a valid memory location and print "Value stored: 42".',
  },
  {
    id: 'c-missing-semicolon-scanf',
    title: 'C: Scanf Missing & Semicolon Error',
    language: 'c',
    category: 'Syntax & I/O',
    description: 'Missing semicolon and passing value instead of memory address to scanf.',
    code: `#include <stdio.h>

int main() {
    int n, sum = 0
    printf("Enter number of terms: ");
    scanf("%d", n); // Missing ampersand (&n) causes memory crash

    for (int i = 1; i <= n; i++) {
        sum += i;
    }

    printf("Sum is: %d\\n", sum);
    return 0;
}`,
    compilerError: 'error: expected \';\' before \'printf\'\nwarning: format \'%d\' expects argument of type \'int *\', but argument 2 has type \'int\'',
    expectedBehavior: 'Read integer n from user input and compute sum of 1 to n.',
  },
  {
    id: 'cpp-vector-out-of-bounds',
    title: 'C++: Vector Off-by-One Boundary',
    language: 'cpp',
    category: 'Arrays & Vectors',
    description: 'Accessing vec[vec.size()] resulting in off-by-one out-of-bounds access.',
    code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> nums = {10, 20, 30, 40, 50};
    std::cout << "Vector elements:\\n";

    // Bug: loop condition uses <= instead of <
    for (size_t i = 0; i <= nums.size(); ++i) {
        std::cout << "Index " << i << ": " << nums[i] << "\\n";
    }

    return 0;
}`,
    compilerError: 'Runtime error: index out of bounds or garbage value printed at index 5',
    expectedBehavior: 'Print elements from index 0 to 4 without reading beyond vector capacity.',
  },
  {
    id: 'cpp-memory-leak',
    title: 'C++: Dynamic Array Leak Without Delete[]',
    language: 'cpp',
    category: 'Memory Management',
    description: 'Allocating dynamic array with new[] but forgetting delete[] or using wrong delete.',
    code: `#include <iostream>

int* createArray(int size) {
    int* arr = new int[size];
    for (int i = 0; i < size; ++i) {
        arr[i] = (i + 1) * 10;
    }
    return arr;
}

int main() {
    int n = 5;
    int* data = createArray(n);

    for (int i = 0; i < n; ++i) {
        std::cout << data[i] << " ";
    }
    std::cout << std::endl;

    // Missing: delete[] data; -> leads to heap memory leak in long running apps
    return 0;
}`,
    expectedBehavior: 'Dynamically allocate array, use elements, and properly release heap memory.',
  },
  {
    id: 'py-indentation-loop',
    title: 'Python: Indentation & Variable Scope',
    language: 'python',
    category: 'Indentation & Scope',
    description: 'A common indentation error where the return statement is indented inside the loop.',
    code: `def find_first_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            print(f"Found even number: {num}")
            return num
        # Indentation bug: return None is inside the for loop, terminating after 1st odd item
        return None

scores = [1, 3, 5, 8, 10]
result = find_first_even(scores)
print(f"Result: {result}")
`,
    compilerError: '',
    expectedBehavior: 'Should inspect the whole list and return 8, but prematurely returns None on first element 1.',
  },
  {
    id: 'py-mutable-default-arg',
    title: 'Python: Mutable Default Argument Bug',
    language: 'python',
    category: 'Functions & Mutability',
    description: 'Using a mutable list as a default parameter retains state across invocations.',
    code: `def register_student(name, enrolled_courses=[]):
    # Bug: enrolled_courses default list is created once at function definition time!
    enrolled_courses.append(name)
    return enrolled_courses

batch1 = register_student("Aman")
batch2 = register_student("Priya")

print("Batch 1:", batch1)
print("Batch 2:", batch2)
# Expected Batch 2 to be ['Priya'], but prints ['Aman', 'Priya']!
`,
    expectedBehavior: 'Each student should receive a fresh default list unless explicitly provided.',
  },
  {
    id: 'py-infinite-recursion',
    title: 'Python: Missing Base Case Recursion',
    language: 'python',
    category: 'Recursion',
    description: 'Factorial function missing base case condition for n <= 1.',
    code: `def factorial(n):
    # Missing base case: if n <= 1: return 1
    return n * factorial(n - 1)

print("Factorial of 5 is:", factorial(5))
`,
    compilerError: 'RecursionError: maximum recursion depth exceeded in comparison',
    expectedBehavior: 'Compute 5! = 120 and terminate cleanly.',
  },
];
