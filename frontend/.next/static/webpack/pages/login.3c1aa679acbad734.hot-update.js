"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/login",{

/***/ "./src/pages/login.js":
/*!****************************!*\
  !*** ./src/pages/login.js ***!
  \****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Login; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_hook_form__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-hook-form */ \"./node_modules/react-hook-form/dist/index.esm.mjs\");\n/* harmony import */ var _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context/AuthContext */ \"./src/context/AuthContext.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var cookies_next__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! cookies-next */ \"./node_modules/cookies-next/lib/index.js\");\n/* harmony import */ var cookies_next__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(cookies_next__WEBPACK_IMPORTED_MODULE_6__);\n\nvar _s = $RefreshSig$();\n\n\n\n\n\n\n\nfunction Login() {\n    _s();\n    const { register , handleSubmit , formState: { errors  }  } = (0,react_hook_form__WEBPACK_IMPORTED_MODULE_7__.useForm)();\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [successMessage, setSuccessMessage] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter)();\n    const { logged_out , callbackUrl  } = router.query;\n    const auth = (0,_context_AuthContext__WEBPACK_IMPORTED_MODULE_2__.useAuth)();\n    // This useEffect ensures that previous auth state is properly cleaned up\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Clear any redirect state to prevent loops\n        localStorage.removeItem(\"isLoggingOut\");\n        // Ensure all token checks run properly on mount\n        const handleTokenCleanup = ()=>{\n            // If logged_out parameter is present, we've just performed a logout\n            if (logged_out === \"true\") {\n                console.log(\"Login page - detected logged_out=true, clearing tokens\");\n                (0,cookies_next__WEBPACK_IMPORTED_MODULE_6__.deleteCookie)(\"token\", {\n                    path: \"/\"\n                });\n                localStorage.removeItem(\"auth_token\");\n                localStorage.removeItem(\"user_data\");\n                // Show success message\n                setSuccessMessage(\"You have been successfully logged out.\");\n                // Clear the query parameter after a delay for cleaner URL\n                setTimeout(()=>{\n                    const url = new URL(window.location.href);\n                    url.searchParams.delete(\"logged_out\");\n                    url.searchParams.delete(\"t\");\n                    window.history.replaceState({}, document.title, url.toString());\n                }, 500);\n            } else {\n                // Check for both token sources\n                const cookieToken = (0,cookies_next__WEBPACK_IMPORTED_MODULE_6__.getCookie)(\"token\");\n                const localToken = localStorage.getItem(\"auth_token\");\n                // If coming from direct URL entry with token present, clear tokens\n                const directEntry = !document.referrer || document.referrer.indexOf(window.location.host) === -1;\n                const hasTokenParam = router.query.t;\n                if ((cookieToken || localToken) && directEntry) {\n                    console.log(\"Login page visited directly with tokens present, clearing stale tokens\");\n                    (0,cookies_next__WEBPACK_IMPORTED_MODULE_6__.deleteCookie)(\"token\", {\n                        path: \"/\"\n                    });\n                    localStorage.removeItem(\"auth_token\");\n                    localStorage.removeItem(\"user_data\");\n                }\n            }\n        };\n        // Run token cleanup when component mounts\n        handleTokenCleanup();\n        // Return cleanup function\n        return ()=>{\n        // No cleanup needed\n        };\n    }, [\n        logged_out\n    ]);\n    const onSubmit = async (data)=>{\n        setIsLoading(true);\n        setError(null);\n        setSuccessMessage(null);\n        try {\n            // Call the login function from auth context\n            await auth.login(data);\n        // Direct navigation is now handled in the login function\n        } catch (err) {\n            var _err_response, _err_response_data;\n            setError((err === null || err === void 0 ? void 0 : (_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.error) || \"Login failed. Please try again.\");\n        } finally{\n            setIsLoading(false);\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_4___default()), {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                    children: \"Login - Secure Auth System\"\n                }, void 0, false, {\n                    fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                    lineNumber: 99,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                lineNumber: 98,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"max-w-md w-full bg-white p-8 rounded-lg shadow-md\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        className: \"text-center text-2xl font-bold text-gray-900 mb-6\",\n                        children: \"Login to Your Account\"\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 103,\n                        columnNumber: 9\n                    }, this),\n                    successMessage && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-green-50 border border-green-200 text-green-800 p-4 mb-4 rounded-md\",\n                        children: successMessage\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 108,\n                        columnNumber: 11\n                    }, this),\n                    error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md\",\n                        children: error\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 114,\n                        columnNumber: 11\n                    }, this),\n                    auth.error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md\",\n                        children: auth.error\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 120,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                        onSubmit: handleSubmit(onSubmit),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"form-group\",\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                        htmlFor: \"email\",\n                                        className: \"block text-sm font-medium text-gray-700\",\n                                        children: \"Email Address\"\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 127,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                        id: \"email\",\n                                        type: \"email\",\n                                        ...register(\"email\", {\n                                            required: \"Email is required\",\n                                            pattern: {\n                                                value: /^\\S+@\\S+$/i,\n                                                message: \"Please enter a valid email\"\n                                            }\n                                        }),\n                                        className: \"form-control \".concat(errors.email ? \"is-invalid\" : \"\")\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 133,\n                                        columnNumber: 13\n                                    }, this),\n                                    errors.email && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: \"error-message\",\n                                        children: errors.email.message\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 146,\n                                        columnNumber: 15\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 126,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"form-group\",\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                        htmlFor: \"password\",\n                                        className: \"block text-sm font-medium text-gray-700\",\n                                        children: \"Password\"\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 151,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                        id: \"password\",\n                                        type: \"password\",\n                                        ...register(\"password\", {\n                                            required: \"Password is required\",\n                                            minLength: {\n                                                value: 8,\n                                                message: \"Password must be at least 8 characters\"\n                                            }\n                                        }),\n                                        className: \"form-control \".concat(errors.password ? \"is-invalid\" : \"\")\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 157,\n                                        columnNumber: 13\n                                    }, this),\n                                    errors.password && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: \"error-message\",\n                                        children: errors.password.message\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 170,\n                                        columnNumber: 15\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 150,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"form-group\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {\n                                    href: \"/forgot-password\",\n                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: \"text-sm text-primary-600 hover:text-primary-500 cursor-pointer\",\n                                        children: \"Forgot your password?\"\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 176,\n                                        columnNumber: 15\n                                    }, this)\n                                }, void 0, false, {\n                                    fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                    lineNumber: 175,\n                                    columnNumber: 13\n                                }, this)\n                            }, void 0, false, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 174,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                type: \"submit\",\n                                className: \"btn btn-primary\",\n                                disabled: isLoading,\n                                children: isLoading ? \"Logging in...\" : \"Login\"\n                            }, void 0, false, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 182,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 125,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                        className: \"mt-6 text-center text-sm text-gray-600\",\n                        children: [\n                            \"Don't have an account?\",\n                            \" \",\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {\n                                href: \"/register\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                    className: \"font-medium text-primary-600 hover:text-primary-500 cursor-pointer\",\n                                    children: \"Register\"\n                                }, void 0, false, {\n                                    fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                    lineNumber: 194,\n                                    columnNumber: 13\n                                }, this)\n                            }, void 0, false, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 193,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 191,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                lineNumber: 102,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n        lineNumber: 97,\n        columnNumber: 5\n    }, this);\n}\n_s(Login, \"LxQgQEpDFDNQ/sFxqWObidvWxxs=\", false, function() {\n    return [\n        react_hook_form__WEBPACK_IMPORTED_MODULE_7__.useForm,\n        next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter,\n        _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__.useAuth\n    ];\n});\n_c = Login;\nvar _c;\n$RefreshReg$(_c, \"Login\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHeEQsU0FBUyxZQUFZOzRDQUN2QnlELFVBQVU7NENBQ1ZNLFdBQVc7Z0RBQ1RKLE9BQU87Z0RBQ1BDLFNBQVM7NENBQ1g7d0NBQ0YsRUFBRTt3Q0FDRlgsV0FBVyxnQkFBb0QsT0FBcEM5QyxPQUFPNkQsUUFBUSxHQUFHLGVBQWUsRUFBRTs7Ozs7O29DQUUvRDdELE9BQU82RCxRQUFRLGtCQUNkLDhEQUFDRjt3Q0FBS2IsV0FBVTtrREFBaUI5QyxPQUFPNkQsUUFBUSxDQUFDSixPQUFPOzs7Ozs7Ozs7Ozs7MENBSTVELDhEQUFDWjtnQ0FBSUMsV0FBVTswQ0FDYiw0RUFBQ3ZELGtEQUFJQTtvQ0FBQ2dDLE1BQUs7OENBQ1QsNEVBQUNvQzt3Q0FBS2IsV0FBVTtrREFBaUU7Ozs7Ozs7Ozs7Ozs7Ozs7MENBTXJGLDhEQUFDZ0I7Z0NBQ0NULE1BQUs7Z0NBQ0xQLFdBQVU7Z0NBQ1ZpQixVQUFVOUQ7MENBRVRBLFlBQVksa0JBQWtCLE9BQU87Ozs7Ozs7Ozs7OztrQ0FJMUMsOERBQUMrRDt3QkFBRWxCLFdBQVU7OzRCQUF5Qzs0QkFDeEI7MENBQzVCLDhEQUFDdkQsa0RBQUlBO2dDQUFDZ0MsTUFBSzswQ0FDVCw0RUFBQ29DO29DQUFLYixXQUFVOzhDQUFxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRakcsQ0FBQztHQWpNdUJsRDs7UUFLbEJQLG9EQUFPQTtRQUlJSSxrREFBU0E7UUFFWEgseURBQU9BOzs7S0FYRU0iLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL3BhZ2VzL2xvZ2luLmpzP2U1YmIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRm9ybSB9IGZyb20gXCJyZWFjdC1ob29rLWZvcm1cIjtcbmltcG9ydCB7IHVzZUF1dGggfSBmcm9tIFwiLi4vY29udGV4dC9BdXRoQ29udGV4dFwiO1xuaW1wb3J0IExpbmsgZnJvbSBcIm5leHQvbGlua1wiO1xuaW1wb3J0IEhlYWQgZnJvbSBcIm5leHQvaGVhZFwiO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSBcIm5leHQvcm91dGVyXCI7XG5pbXBvcnQgeyBnZXRDb29raWUsIGRlbGV0ZUNvb2tpZSB9IGZyb20gXCJjb29raWVzLW5leHRcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTG9naW4oKSB7XG4gIGNvbnN0IHtcbiAgICByZWdpc3RlcixcbiAgICBoYW5kbGVTdWJtaXQsXG4gICAgZm9ybVN0YXRlOiB7IGVycm9ycyB9LFxuICB9ID0gdXNlRm9ybSgpO1xuICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbc3VjY2Vzc01lc3NhZ2UsIHNldFN1Y2Nlc3NNZXNzYWdlXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCByb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcbiAgY29uc3QgeyBsb2dnZWRfb3V0LCBjYWxsYmFja1VybCB9ID0gcm91dGVyLnF1ZXJ5O1xuICBjb25zdCBhdXRoID0gdXNlQXV0aCgpO1xuXG4gIC8vIFRoaXMgdXNlRWZmZWN0IGVuc3VyZXMgdGhhdCBwcmV2aW91cyBhdXRoIHN0YXRlIGlzIHByb3Blcmx5IGNsZWFuZWQgdXBcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBDbGVhciBhbnkgcmVkaXJlY3Qgc3RhdGUgdG8gcHJldmVudCBsb29wc1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiaXNMb2dnaW5nT3V0XCIpO1xuXG4gICAgLy8gRW5zdXJlIGFsbCB0b2tlbiBjaGVja3MgcnVuIHByb3Blcmx5IG9uIG1vdW50XG4gICAgY29uc3QgaGFuZGxlVG9rZW5DbGVhbnVwID0gKCkgPT4ge1xuICAgICAgLy8gSWYgbG9nZ2VkX291dCBwYXJhbWV0ZXIgaXMgcHJlc2VudCwgd2UndmUganVzdCBwZXJmb3JtZWQgYSBsb2dvdXRcbiAgICAgIGlmIChsb2dnZWRfb3V0ID09PSBcInRydWVcIikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkxvZ2luIHBhZ2UgLSBkZXRlY3RlZCBsb2dnZWRfb3V0PXRydWUsIGNsZWFyaW5nIHRva2Vuc1wiKTtcbiAgICAgICAgZGVsZXRlQ29va2llKFwidG9rZW5cIiwgeyBwYXRoOiBcIi9cIiB9KTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJhdXRoX3Rva2VuXCIpO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJfZGF0YVwiKTtcblxuICAgICAgICAvLyBTaG93IHN1Y2Nlc3MgbWVzc2FnZVxuICAgICAgICBzZXRTdWNjZXNzTWVzc2FnZShcIllvdSBoYXZlIGJlZW4gc3VjY2Vzc2Z1bGx5IGxvZ2dlZCBvdXQuXCIpO1xuXG4gICAgICAgIC8vIENsZWFyIHRoZSBxdWVyeSBwYXJhbWV0ZXIgYWZ0ZXIgYSBkZWxheSBmb3IgY2xlYW5lciBVUkxcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUoXCJsb2dnZWRfb3V0XCIpO1xuICAgICAgICAgIHVybC5zZWFyY2hQYXJhbXMuZGVsZXRlKFwidFwiKTtcbiAgICAgICAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sIGRvY3VtZW50LnRpdGxlLCB1cmwudG9TdHJpbmcoKSk7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgICB9XG4gICAgICAvLyBSZWd1bGFyIGxvZ2luIHBhZ2UgdmlzaXQgLSBjaGVjayBmb3Igc3RhbGUgdG9rZW5zXG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGJvdGggdG9rZW4gc291cmNlc1xuICAgICAgICBjb25zdCBjb29raWVUb2tlbiA9IGdldENvb2tpZShcInRva2VuXCIpO1xuICAgICAgICBjb25zdCBsb2NhbFRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJhdXRoX3Rva2VuXCIpO1xuXG4gICAgICAgIC8vIElmIGNvbWluZyBmcm9tIGRpcmVjdCBVUkwgZW50cnkgd2l0aCB0b2tlbiBwcmVzZW50LCBjbGVhciB0b2tlbnNcbiAgICAgICAgY29uc3QgZGlyZWN0RW50cnkgPVxuICAgICAgICAgICFkb2N1bWVudC5yZWZlcnJlciB8fFxuICAgICAgICAgIGRvY3VtZW50LnJlZmVycmVyLmluZGV4T2Yod2luZG93LmxvY2F0aW9uLmhvc3QpID09PSAtMTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhhc1Rva2VuUGFyYW0gPSByb3V0ZXIucXVlcnkudDtcblxuICAgICAgICBpZiAoKGNvb2tpZVRva2VuIHx8IGxvY2FsVG9rZW4pICYmIGRpcmVjdEVudHJ5ICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgXCJMb2dpbiBwYWdlIHZpc2l0ZWQgZGlyZWN0bHkgd2l0aCB0b2tlbnMgcHJlc2VudCwgY2xlYXJpbmcgc3RhbGUgdG9rZW5zXCJcbiAgICAgICAgICApO1xuICAgICAgICAgIGRlbGV0ZUNvb2tpZShcInRva2VuXCIsIHsgcGF0aDogXCIvXCIgfSk7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJhdXRoX3Rva2VuXCIpO1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwidXNlcl9kYXRhXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFJ1biB0b2tlbiBjbGVhbnVwIHdoZW4gY29tcG9uZW50IG1vdW50c1xuICAgIGhhbmRsZVRva2VuQ2xlYW51cCgpO1xuXG4gICAgLy8gUmV0dXJuIGNsZWFudXAgZnVuY3Rpb25cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gTm8gY2xlYW51cCBuZWVkZWRcbiAgICB9O1xuICB9LCBbbG9nZ2VkX291dF0pO1xuXG4gIGNvbnN0IG9uU3VibWl0ID0gYXN5bmMgKGRhdGEpID0+IHtcbiAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgc2V0RXJyb3IobnVsbCk7XG4gICAgc2V0U3VjY2Vzc01lc3NhZ2UobnVsbCk7XG5cbiAgICB0cnkge1xuICAgICAgLy8gQ2FsbCB0aGUgbG9naW4gZnVuY3Rpb24gZnJvbSBhdXRoIGNvbnRleHRcbiAgICAgIGF3YWl0IGF1dGgubG9naW4oZGF0YSk7XG4gICAgICAvLyBEaXJlY3QgbmF2aWdhdGlvbiBpcyBub3cgaGFuZGxlZCBpbiB0aGUgbG9naW4gZnVuY3Rpb25cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNldEVycm9yKGVycj8ucmVzcG9uc2U/LmRhdGE/LmVycm9yIHx8IFwiTG9naW4gZmFpbGVkLiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBiZy1ncmF5LTEwMCBweS0xMiBweC00IHNtOnB4LTYgbGc6cHgtOFwiPlxuICAgICAgPEhlYWQ+XG4gICAgICAgIDx0aXRsZT5Mb2dpbiAtIFNlY3VyZSBBdXRoIFN5c3RlbTwvdGl0bGU+XG4gICAgICA8L0hlYWQ+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctbWQgdy1mdWxsIGJnLXdoaXRlIHAtOCByb3VuZGVkLWxnIHNoYWRvdy1tZFwiPlxuICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgdGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgbWItNlwiPlxuICAgICAgICAgIExvZ2luIHRvIFlvdXIgQWNjb3VudFxuICAgICAgICA8L2gxPlxuXG4gICAgICAgIHtzdWNjZXNzTWVzc2FnZSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ncmVlbi01MCBib3JkZXIgYm9yZGVyLWdyZWVuLTIwMCB0ZXh0LWdyZWVuLTgwMCBwLTQgbWItNCByb3VuZGVkLW1kXCI+XG4gICAgICAgICAgICB7c3VjY2Vzc01lc3NhZ2V9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAge2Vycm9yICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXJlZC01MCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgdGV4dC1yZWQtODAwIHAtNCBtYi00IHJvdW5kZWQtbWRcIj5cbiAgICAgICAgICAgIHtlcnJvcn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7YXV0aC5lcnJvciAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1yZWQtNTAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIHRleHQtcmVkLTgwMCBwLTQgbWItNCByb3VuZGVkLW1kXCI+XG4gICAgICAgICAgICB7YXV0aC5lcnJvcn1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0KG9uU3VibWl0KX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWxcbiAgICAgICAgICAgICAgaHRtbEZvcj1cImVtYWlsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgRW1haWwgQWRkcmVzc1xuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBpZD1cImVtYWlsXCJcbiAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgey4uLnJlZ2lzdGVyKFwiZW1haWxcIiwge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBcIkVtYWlsIGlzIHJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgcGF0dGVybjoge1xuICAgICAgICAgICAgICAgICAgdmFsdWU6IC9eXFxTK0BcXFMrJC9pLFxuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJQbGVhc2UgZW50ZXIgYSB2YWxpZCBlbWFpbFwiLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bmb3JtLWNvbnRyb2wgJHtlcnJvcnMuZW1haWwgPyBcImlzLWludmFsaWRcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICB7ZXJyb3JzLmVtYWlsICYmIChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZXJyb3ItbWVzc2FnZVwiPntlcnJvcnMuZW1haWwubWVzc2FnZX08L3NwYW4+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWxcbiAgICAgICAgICAgICAgaHRtbEZvcj1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgUGFzc3dvcmRcbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgIHsuLi5yZWdpc3RlcihcInBhc3N3b3JkXCIsIHtcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogXCJQYXNzd29yZCBpcyByZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIG1pbkxlbmd0aDoge1xuICAgICAgICAgICAgICAgICAgdmFsdWU6IDgsXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZvcm0tY29udHJvbCAke2Vycm9ycy5wYXNzd29yZCA/IFwiaXMtaW52YWxpZFwiIDogXCJcIn1gfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMucGFzc3dvcmQgJiYgKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJlcnJvci1tZXNzYWdlXCI+e2Vycm9ycy5wYXNzd29yZC5tZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxMaW5rIGhyZWY9XCIvZm9yZ290LXBhc3N3b3JkXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1wcmltYXJ5LTYwMCBob3Zlcjp0ZXh0LXByaW1hcnktNTAwIGN1cnNvci1wb2ludGVyXCI+XG4gICAgICAgICAgICAgICAgRm9yZ290IHlvdXIgcGFzc3dvcmQ/XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtpc0xvYWRpbmd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2lzTG9hZGluZyA/IFwiTG9nZ2luZyBpbi4uLlwiIDogXCJMb2dpblwifVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgPHAgY2xhc3NOYW1lPVwibXQtNiB0ZXh0LWNlbnRlciB0ZXh0LXNtIHRleHQtZ3JheS02MDBcIj5cbiAgICAgICAgICBEb24mYXBvczt0IGhhdmUgYW4gYWNjb3VudD97XCIgXCJ9XG4gICAgICAgICAgPExpbmsgaHJlZj1cIi9yZWdpc3RlclwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tZWRpdW0gdGV4dC1wcmltYXJ5LTYwMCBob3Zlcjp0ZXh0LXByaW1hcnktNTAwIGN1cnNvci1wb2ludGVyXCI+XG4gICAgICAgICAgICAgIFJlZ2lzdGVyXG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9MaW5rPlxuICAgICAgICA8L3A+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZUZvcm0iLCJ1c2VBdXRoIiwiTGluayIsIkhlYWQiLCJ1c2VSb3V0ZXIiLCJnZXRDb29raWUiLCJkZWxldGVDb29raWUiLCJMb2dpbiIsInJlZ2lzdGVyIiwiaGFuZGxlU3VibWl0IiwiZm9ybVN0YXRlIiwiZXJyb3JzIiwiaXNMb2FkaW5nIiwic2V0SXNMb2FkaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsInN1Y2Nlc3NNZXNzYWdlIiwic2V0U3VjY2Vzc01lc3NhZ2UiLCJyb3V0ZXIiLCJsb2dnZWRfb3V0IiwiY2FsbGJhY2tVcmwiLCJxdWVyeSIsImF1dGgiLCJsb2NhbFN0b3JhZ2UiLCJyZW1vdmVJdGVtIiwiaGFuZGxlVG9rZW5DbGVhbnVwIiwiY29uc29sZSIsImxvZyIsInBhdGgiLCJzZXRUaW1lb3V0IiwidXJsIiwiVVJMIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwic2VhcmNoUGFyYW1zIiwiZGVsZXRlIiwiaGlzdG9yeSIsInJlcGxhY2VTdGF0ZSIsImRvY3VtZW50IiwidGl0bGUiLCJ0b1N0cmluZyIsImNvb2tpZVRva2VuIiwibG9jYWxUb2tlbiIsImdldEl0ZW0iLCJkaXJlY3RFbnRyeSIsInJlZmVycmVyIiwiaW5kZXhPZiIsImhvc3QiLCJoYXNUb2tlblBhcmFtIiwidCIsIm9uU3VibWl0IiwiZGF0YSIsImxvZ2luIiwiZXJyIiwicmVzcG9uc2UiLCJkaXYiLCJjbGFzc05hbWUiLCJoMSIsImZvcm0iLCJsYWJlbCIsImh0bWxGb3IiLCJpbnB1dCIsImlkIiwidHlwZSIsInJlcXVpcmVkIiwicGF0dGVybiIsInZhbHVlIiwibWVzc2FnZSIsImVtYWlsIiwic3BhbiIsIm1pbkxlbmd0aCIsInBhc3N3b3JkIiwiYnV0dG9uIiwiZGlzYWJsZWQiLCJwIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/login.js\n"));

/***/ })

});