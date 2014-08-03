(function() {

    var qunit = window.QUnit;

    var report = totoro.report;
    var id = totoro.getOrderId(location.href);
    
    var stats = {
        suites: 0,
        tests: 0,
        passes: 0,
        pending: 0,
        failures: 0
    };

    function sendMessage(action, info) {
        report({
            orderId: id,
            action: action,
            info: info
        });
    }

    var testStartTime;
    var startedSuites = {};
    var testLogMessages;

    // When test suite begins
    qunit.begin(function() {

    });

    // When module starts
    qunit.moduleStart(function(details) {

    });

    // When a test block begins
    qunit.testStart(function(details) {

        testStartTime = (+new Date());

        testLogMessages = [];
    });

    // When an assertion completes
    qunit.log(function(details) {
        // details: { result, actual, expected, message }

        // If the assertion failed, record it's message and trace
        if (!details.result) {
            testLogMessages.push(formatError(details));
        }
    });

    // When a test block ends
    qunit.testDone(function(details) {
        // testDone: { name, failed, passed, total, duration }

        var data = {
            parent: details.module,
            title: details.name,
            duration: details.duration,
            tests: details.total,
            passes: details.passed,
            failures: details.failed,
            message: ''
        };

        var action = 'pass';

        if (details.failed > 0) {
            action = 'fail';
            data.message += testLogMessages.join('\n');
        }

        sendMessage(action, data);
    });

    // When a module ends
    qunit.moduleDone(function(details) {
        // moduleDone: { name, failed, passed, total }
    });

    // When a test suite ends
    qunit.done(function(details) {
        // done: { failed, passed, total, runtime }

        stats.duration = details.runtime;
        stats.passes = details.passed;
        stats.failures = details.failed;
        stats.tests = details.total,

        sendMessage('end', stats);

        // Clean up
        testStartTime = null;
        testLogMessages = null;
    });

    var LIBRARY_JUNK_REGEX = /.*qunit.*\.js/i;
    var THRILL_JUNK_REGEX = /\(.*\/g\/.*?\//i;
    var QUEEN_JUNK_REGEX = /\?queenSocketId=([\w\-])*/i;
    var NEW_LINE_REGEX = /\n/g;

    // log: { result, actual, expected, message }

    function formatError(details) {
        var message = details.message || "",
            stack = details.source;

        if (details.result) return message;

        if (details.expected) {
            message += " (Expected: " + details.expected + ", Actual: " + details.actual + ")";
        }

        if (stack) {
            stack = stack.split(NEW_LINE_REGEX);

            stack = filter(stack, function(line, index, arr) {
                if (LIBRARY_JUNK_REGEX.test(line)) return false;

                // Remove the junk queen adds on
                // We have to address the array by index in this case
                // so the line actually gets updated
                arr[index] = line.replace(THRILL_JUNK_REGEX, '(').replace(QUEEN_JUNK_REGEX, '');

                return true;
            });

            message += (message ? "\n" : "") + stack.join('\n');
        }

        return message;
    }

    function each(arr, func) {
        var index = 0,
            length = arr.length;

        for (; index < length; index++) {
            func.call(null, arr[index], index, arr);
        }
    }

    function filter(arr, func) {
        var index = 0,
            length = arr.length,
            result = [];

        for (; index < length; index++) {
            if (func.call(null, arr[index], index, arr)) {
                result.push(arr[index]);
            }
        }
        return result;
    }
})();