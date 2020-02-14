# Testing Integration Code

The NS8 PHP Protect SDK & NS8 JavaScript Protect SDK that are utilized within this Magento are both at 100% test coverage for unit tests. The intent of unit testing these components is to ensure any issues/bugs that surface during the process of development are isolated to module implementation or misuse of the Protect API. Testing architecture is also intended to remove any dependencies on outside resources or make references to potential frameworks utilizing the SDK to avoid partial reliance on specific utilities or trigger inconsistent results.

## PHP SDK Testing

The NS8 Protect PHP SDK has unit tests covering all methods with detailed `@covers` test attributes mapping testing methods to source methods. HTTP methods and implementation details are mocked using the Zend HTTP Test Adapter and configuration logic is tested through building dynamic configuration sets for the runtime of unit tests. Each unit test is intended to validate core attributes of methods including:

* Parameter validation
* Valid data types and correct use of data types
* Translated "business logic" is applied as needed
* Exceptions are thrown as needed and in the proper circumstances
* Exceptions and errors are handled elegantly and logged accordingly

In regards to test frequency and coverage, tests are required to be passing fully and at 100% coverage for any branch commits pushed to the repository. There are pre-commit and pre-push hooks in place to validate linting, test validation, and code coverage for all code implemented.

## JS SDK Testing

The NS8 JS SDK has unit testing covering all methods except for limited exceptions for lines marked with `istanbul ignore` statements. Lines marked with ignore statements have explanations for why they are ignored and were determined to not be impactful to the overall accuracy of test results and code coverage. The general implementation of JS unit tests are intended to:

* Object implementations work as expexted
* DOM elements are present and functionality works as expected
* Validation of components and configuration attributes function appropriately
* Interaction events trigger the appropriate responses within the SDK

Similar to the PHP SDK, tests are required to be passing fully and at 100% coverage (outside of explained ignore statements) for any branch commits pushed to the repository. Pre-commit and pre-push hooks are present to validate linting, testing, and code coverage for all changes implemented.

## Future changes for module testing

NS8 does not presently have automated tests for the Protect module itself. There is careful developer and QA testing present for changes that are implemented for the Magento module which serves as a safeguard to reduce potential issues. Chai has been set-up as a testing framework for the module and there plans to begin introducing automated testing with this framework in the future.
