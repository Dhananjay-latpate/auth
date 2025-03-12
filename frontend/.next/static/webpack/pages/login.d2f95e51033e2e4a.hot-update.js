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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Login; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_hook_form__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-hook-form */ \"./node_modules/react-hook-form/dist/index.esm.mjs\");\n/* harmony import */ var _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../context/AuthContext */ \"./src/context/AuthContext.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/link */ \"./node_modules/next/link.js\");\n/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var cookies_next__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! cookies-next */ \"./node_modules/cookies-next/lib/index.js\");\n/* harmony import */ var cookies_next__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(cookies_next__WEBPACK_IMPORTED_MODULE_6__);\n\nvar _s = $RefreshSig$();\n\n\n\n\n\n\n\nfunction Login() {\n    _s();\n    const { register , handleSubmit , formState: { errors  }  } = (0,react_hook_form__WEBPACK_IMPORTED_MODULE_7__.useForm)();\n    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [successMessage, setSuccessMessage] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter)();\n    const { logged_out , callbackUrl  } = router.query;\n    const auth = (0,_context_AuthContext__WEBPACK_IMPORTED_MODULE_2__.useAuth)();\n    // This useEffect ensures that previous auth state is properly cleaned up\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        // Clear any redirect state to prevent loops\n        localStorage.removeItem(\"isLoggingOut\");\n        // Ensure all token checks run properly on mount\n        const handleTokenCleanup = ()=>{\n            // If logged_out parameter is present, we've just performed a logout\n            if (logged_out === \"true\") {\n                console.log(\"Login page - detected logged_out=true, clearing tokens\");\n                (0,cookies_next__WEBPACK_IMPORTED_MODULE_6__.deleteCookie)(\"token\", {\n                    path: \"/\"\n                });\n                localStorage.removeItem(\"auth_token\");\n                localStorage.removeItem(\"user_data\");\n                // Show success message\n                setSuccessMessage(\"You have been successfully logged out.\");\n                // Clear the query parameter after a delay for cleaner URL\n                setTimeout(()=>{\n                    const url = new URL(window.location.href);\n                    url.searchParams.delete(\"logged_out\");\n                    url.searchParams.delete(\"t\");\n                    window.history.replaceState({}, document.title, url.toString());\n                }, 500);\n            } else {\n                // Check for both token sources\n                const cookieToken = (0,cookies_next__WEBPACK_IMPORTED_MODULE_6__.getCookie)(\"token\");\n                const localToken = localStorage.getItem(\"auth_token\");\n                // If coming from direct URL entry with token present, clear tokens\n                const directEntry = !document.referrer || document.referrer.indexOf(window.location.host) === -1;\n                if ((cookieToken || localToken) && directEntry) {\n                    console.log(\"Login page visited directly with tokens present, clearing stale tokens\");\n                    (0,cookies_next__WEBPACK_IMPORTED_MODULE_6__.deleteCookie)(\"token\", {\n                        path: \"/\"\n                    });\n                    localStorage.removeItem(\"auth_token\");\n                    localStorage.removeItem(\"user_data\");\n                }\n            }\n        };\n        // Run token cleanup when component mounts\n        handleTokenCleanup();\n        // Return cleanup function\n        return ()=>{\n        // No cleanup needed\n        };\n    }, [\n        logged_out\n    ]);\n    const onSubmit = async (data)=>{\n        setIsLoading(true);\n        setError(null);\n        setSuccessMessage(null);\n        try {\n            // Call the login function from auth context\n            await auth.login(data);\n        // Direct navigation is now handled in the login function\n        } catch (err) {\n            var _err_response, _err_response_data;\n            setError((err === null || err === void 0 ? void 0 : (_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.error) || \"Login failed. Please try again.\");\n        } finally{\n            setIsLoading(false);\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_head__WEBPACK_IMPORTED_MODULE_4___default()), {\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"title\", {\n                    children: \"Login - Secure Auth System\"\n                }, void 0, false, {\n                    fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                    lineNumber: 97,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                lineNumber: 96,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"max-w-md w-full bg-white p-8 rounded-lg shadow-md\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        className: \"text-center text-2xl font-bold text-gray-900 mb-6\",\n                        children: \"Login to Your Account\"\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 101,\n                        columnNumber: 9\n                    }, this),\n                    successMessage && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-green-50 border border-green-200 text-green-800 p-4 mb-4 rounded-md\",\n                        children: successMessage\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 106,\n                        columnNumber: 11\n                    }, this),\n                    error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md\",\n                        children: error\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 112,\n                        columnNumber: 11\n                    }, this),\n                    auth.error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"bg-red-50 border border-red-200 text-red-800 p-4 mb-4 rounded-md\",\n                        children: auth.error\n                    }, void 0, false, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 118,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                        onSubmit: handleSubmit(onSubmit),\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"form-group\",\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                        htmlFor: \"email\",\n                                        className: \"block text-sm font-medium text-gray-700\",\n                                        children: \"Email Address\"\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 125,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                        id: \"email\",\n                                        type: \"email\",\n                                        ...register(\"email\", {\n                                            required: \"Email is required\",\n                                            pattern: {\n                                                value: /^\\S+@\\S+$/i,\n                                                message: \"Please enter a valid email\"\n                                            }\n                                        }),\n                                        className: \"form-control \".concat(errors.email ? \"is-invalid\" : \"\")\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 131,\n                                        columnNumber: 13\n                                    }, this),\n                                    errors.email && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: \"error-message\",\n                                        children: errors.email.message\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 144,\n                                        columnNumber: 15\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 124,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"form-group\",\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"label\", {\n                                        htmlFor: \"password\",\n                                        className: \"block text-sm font-medium text-gray-700\",\n                                        children: \"Password\"\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 149,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                        id: \"password\",\n                                        type: \"password\",\n                                        ...register(\"password\", {\n                                            required: \"Password is required\",\n                                            minLength: {\n                                                value: 8,\n                                                message: \"Password must be at least 8 characters\"\n                                            }\n                                        }),\n                                        className: \"form-control \".concat(errors.password ? \"is-invalid\" : \"\")\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 155,\n                                        columnNumber: 13\n                                    }, this),\n                                    errors.password && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: \"error-message\",\n                                        children: errors.password.message\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 168,\n                                        columnNumber: 15\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 148,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"form-group\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {\n                                    href: \"/forgot-password\",\n                                    children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                        className: \"text-sm text-primary-600 hover:text-primary-500 cursor-pointer\",\n                                        children: \"Forgot your password?\"\n                                    }, void 0, false, {\n                                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                        lineNumber: 174,\n                                        columnNumber: 15\n                                    }, this)\n                                }, void 0, false, {\n                                    fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                    lineNumber: 173,\n                                    columnNumber: 13\n                                }, this)\n                            }, void 0, false, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 172,\n                                columnNumber: 11\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                type: \"submit\",\n                                className: \"btn btn-primary\",\n                                disabled: isLoading,\n                                children: isLoading ? \"Logging in...\" : \"Login\"\n                            }, void 0, false, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 180,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 123,\n                        columnNumber: 9\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                        className: \"mt-6 text-center text-sm text-gray-600\",\n                        children: [\n                            \"Don't have an account?\",\n                            \" \",\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {\n                                href: \"/register\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"span\", {\n                                    className: \"font-medium text-primary-600 hover:text-primary-500 cursor-pointer\",\n                                    children: \"Register\"\n                                }, void 0, false, {\n                                    fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                    lineNumber: 192,\n                                    columnNumber: 13\n                                }, this)\n                            }, void 0, false, {\n                                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                                lineNumber: 191,\n                                columnNumber: 11\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                        lineNumber: 189,\n                        columnNumber: 9\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n                lineNumber: 100,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/home/redlight/auth/frontend/src/pages/login.js\",\n        lineNumber: 95,\n        columnNumber: 5\n    }, this);\n}\n_s(Login, \"LxQgQEpDFDNQ/sFxqWObidvWxxs=\", false, function() {\n    return [\n        react_hook_form__WEBPACK_IMPORTED_MODULE_7__.useForm,\n        next_router__WEBPACK_IMPORTED_MODULE_5__.useRouter,\n        _context_AuthContext__WEBPACK_IMPORTED_MODULE_2__.useAuth\n    ];\n});\n_c = Login;\nvar _c;\n$RefreshReg$(_c, \"Login\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VEosT0FBTztnREFDUEMsU0FBUzs0Q0FDWDt3Q0FDRixFQUFFO3dDQUNGWCxXQUFXLGdCQUFvRCxPQUFwQzVDLE9BQU8yRCxRQUFRLEdBQUcsZUFBZSxFQUFFOzs7Ozs7b0NBRS9EM0QsT0FBTzJELFFBQVEsa0JBQ2QsOERBQUNGO3dDQUFLYixXQUFVO2tEQUFpQjVDLE9BQU8yRCxRQUFRLENBQUNKLE9BQU87Ozs7Ozs7Ozs7OzswQ0FJNUQsOERBQUNaO2dDQUFJQyxXQUFVOzBDQUNiLDRFQUFDckQsa0RBQUlBO29DQUFDZ0MsTUFBSzs4Q0FDVCw0RUFBQ2tDO3dDQUFLYixXQUFVO2tEQUFpRTs7Ozs7Ozs7Ozs7Ozs7OzswQ0FNckYsOERBQUNnQjtnQ0FDQ1QsTUFBSztnQ0FDTFAsV0FBVTtnQ0FDVmlCLFVBQVU1RDswQ0FFVEEsWUFBWSxrQkFBa0IsT0FBTzs7Ozs7Ozs7Ozs7O2tDQUkxQyw4REFBQzZEO3dCQUFFbEIsV0FBVTs7NEJBQXlDOzRCQUN4QjswQ0FDNUIsOERBQUNyRCxrREFBSUE7Z0NBQUNnQyxNQUFLOzBDQUNULDRFQUFDa0M7b0NBQUtiLFdBQVU7OENBQXFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVFqRyxDQUFDO0dBL0x1QmhEOztRQUtsQlAsb0RBQU9BO1FBSUlJLGtEQUFTQTtRQUVYSCx5REFBT0E7OztLQVhFTSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvcGFnZXMvbG9naW4uanM/ZTViYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VGb3JtIH0gZnJvbSBcInJlYWN0LWhvb2stZm9ybVwiO1xuaW1wb3J0IHsgdXNlQXV0aCB9IGZyb20gXCIuLi9jb250ZXh0L0F1dGhDb250ZXh0XCI7XG5pbXBvcnQgTGluayBmcm9tIFwibmV4dC9saW5rXCI7XG5pbXBvcnQgSGVhZCBmcm9tIFwibmV4dC9oZWFkXCI7XG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tIFwibmV4dC9yb3V0ZXJcIjtcbmltcG9ydCB7IGdldENvb2tpZSwgZGVsZXRlQ29va2llIH0gZnJvbSBcImNvb2tpZXMtbmV4dFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBMb2dpbigpIHtcbiAgY29uc3Qge1xuICAgIHJlZ2lzdGVyLFxuICAgIGhhbmRsZVN1Ym1pdCxcbiAgICBmb3JtU3RhdGU6IHsgZXJyb3JzIH0sXG4gIH0gPSB1c2VGb3JtKCk7XG4gIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IFtzdWNjZXNzTWVzc2FnZSwgc2V0U3VjY2Vzc01lc3NhZ2VdID0gdXNlU3RhdGUobnVsbCk7XG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xuICBjb25zdCB7IGxvZ2dlZF9vdXQsIGNhbGxiYWNrVXJsIH0gPSByb3V0ZXIucXVlcnk7XG4gIGNvbnN0IGF1dGggPSB1c2VBdXRoKCk7XG5cbiAgLy8gVGhpcyB1c2VFZmZlY3QgZW5zdXJlcyB0aGF0IHByZXZpb3VzIGF1dGggc3RhdGUgaXMgcHJvcGVybHkgY2xlYW5lZCB1cFxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIENsZWFyIGFueSByZWRpcmVjdCBzdGF0ZSB0byBwcmV2ZW50IGxvb3BzXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJpc0xvZ2dpbmdPdXRcIik7XG5cbiAgICAvLyBFbnN1cmUgYWxsIHRva2VuIGNoZWNrcyBydW4gcHJvcGVybHkgb24gbW91bnRcbiAgICBjb25zdCBoYW5kbGVUb2tlbkNsZWFudXAgPSAoKSA9PiB7XG4gICAgICAvLyBJZiBsb2dnZWRfb3V0IHBhcmFtZXRlciBpcyBwcmVzZW50LCB3ZSd2ZSBqdXN0IHBlcmZvcm1lZCBhIGxvZ291dFxuICAgICAgaWYgKGxvZ2dlZF9vdXQgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiTG9naW4gcGFnZSAtIGRldGVjdGVkIGxvZ2dlZF9vdXQ9dHJ1ZSwgY2xlYXJpbmcgdG9rZW5zXCIpO1xuICAgICAgICBkZWxldGVDb29raWUoXCJ0b2tlblwiLCB7IHBhdGg6IFwiL1wiIH0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImF1dGhfdG9rZW5cIik7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwidXNlcl9kYXRhXCIpO1xuXG4gICAgICAgIC8vIFNob3cgc3VjY2VzcyBtZXNzYWdlXG4gICAgICAgIHNldFN1Y2Nlc3NNZXNzYWdlKFwiWW91IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgbG9nZ2VkIG91dC5cIik7XG5cbiAgICAgICAgLy8gQ2xlYXIgdGhlIHF1ZXJ5IHBhcmFtZXRlciBhZnRlciBhIGRlbGF5IGZvciBjbGVhbmVyIFVSTFxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmRlbGV0ZShcImxvZ2dlZF9vdXRcIik7XG4gICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5kZWxldGUoXCJ0XCIpO1xuICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHVybC50b1N0cmluZygpKTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH1cbiAgICAgIC8vIFJlZ3VsYXIgbG9naW4gcGFnZSB2aXNpdCAtIGNoZWNrIGZvciBzdGFsZSB0b2tlbnNcbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBDaGVjayBmb3IgYm90aCB0b2tlbiBzb3VyY2VzXG4gICAgICAgIGNvbnN0IGNvb2tpZVRva2VuID0gZ2V0Q29va2llKFwidG9rZW5cIik7XG4gICAgICAgIGNvbnN0IGxvY2FsVG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImF1dGhfdG9rZW5cIik7XG5cbiAgICAgICAgLy8gSWYgY29taW5nIGZyb20gZGlyZWN0IFVSTCBlbnRyeSB3aXRoIHRva2VuIHByZXNlbnQsIGNsZWFyIHRva2Vuc1xuICAgICAgICBjb25zdCBkaXJlY3RFbnRyeSA9XG4gICAgICAgICAgIWRvY3VtZW50LnJlZmVycmVyIHx8XG4gICAgICAgICAgZG9jdW1lbnQucmVmZXJyZXIuaW5kZXhPZih3aW5kb3cubG9jYXRpb24uaG9zdCkgPT09IC0xO1xuXG4gICAgICAgIGlmICgoY29va2llVG9rZW4gfHwgbG9jYWxUb2tlbikgJiYgZGlyZWN0RW50cnkgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcIkxvZ2luIHBhZ2UgdmlzaXRlZCBkaXJlY3RseSB3aXRoIHRva2VucyBwcmVzZW50LCBjbGVhcmluZyBzdGFsZSB0b2tlbnNcIlxuICAgICAgICAgICk7XG4gICAgICAgICAgZGVsZXRlQ29va2llKFwidG9rZW5cIiwgeyBwYXRoOiBcIi9cIiB9KTtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImF1dGhfdG9rZW5cIik7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyX2RhdGFcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUnVuIHRva2VuIGNsZWFudXAgd2hlbiBjb21wb25lbnQgbW91bnRzXG4gICAgaGFuZGxlVG9rZW5DbGVhbnVwKCk7XG5cbiAgICAvLyBSZXR1cm4gY2xlYW51cCBmdW5jdGlvblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAvLyBObyBjbGVhbnVwIG5lZWRlZFxuICAgIH07XG4gIH0sIFtsb2dnZWRfb3V0XSk7XG5cbiAgY29uc3Qgb25TdWJtaXQgPSBhc3luYyAoZGF0YSkgPT4ge1xuICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICBzZXRFcnJvcihudWxsKTtcbiAgICBzZXRTdWNjZXNzTWVzc2FnZShudWxsKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBDYWxsIHRoZSBsb2dpbiBmdW5jdGlvbiBmcm9tIGF1dGggY29udGV4dFxuICAgICAgYXdhaXQgYXV0aC5sb2dpbihkYXRhKTtcbiAgICAgIC8vIERpcmVjdCBuYXZpZ2F0aW9uIGlzIG5vdyBoYW5kbGVkIGluIHRoZSBsb2dpbiBmdW5jdGlvblxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgc2V0RXJyb3IoZXJyPy5yZXNwb25zZT8uZGF0YT8uZXJyb3IgfHwgXCJMb2dpbiBmYWlsZWQuIFBsZWFzZSB0cnkgYWdhaW4uXCIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLWdyYXktMTAwIHB5LTEyIHB4LTQgc206cHgtNiBsZzpweC04XCI+XG4gICAgICA8SGVhZD5cbiAgICAgICAgPHRpdGxlPkxvZ2luIC0gU2VjdXJlIEF1dGggU3lzdGVtPC90aXRsZT5cbiAgICAgIDwvSGVhZD5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy1tZCB3LWZ1bGwgYmctd2hpdGUgcC04IHJvdW5kZWQtbGcgc2hhZG93LW1kXCI+XG4gICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciB0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBtYi02XCI+XG4gICAgICAgICAgTG9naW4gdG8gWW91ciBBY2NvdW50XG4gICAgICAgIDwvaDE+XG5cbiAgICAgICAge3N1Y2Nlc3NNZXNzYWdlICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWdyZWVuLTUwIGJvcmRlciBib3JkZXItZ3JlZW4tMjAwIHRleHQtZ3JlZW4tODAwIHAtNCBtYi00IHJvdW5kZWQtbWRcIj5cbiAgICAgICAgICAgIHtzdWNjZXNzTWVzc2FnZX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7ZXJyb3IgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctcmVkLTUwIGJvcmRlciBib3JkZXItcmVkLTIwMCB0ZXh0LXJlZC04MDAgcC00IG1iLTQgcm91bmRlZC1tZFwiPlxuICAgICAgICAgICAge2Vycm9yfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIHthdXRoLmVycm9yICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXJlZC01MCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgdGV4dC1yZWQtODAwIHAtNCBtYi00IHJvdW5kZWQtbWRcIj5cbiAgICAgICAgICAgIHthdXRoLmVycm9yfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVTdWJtaXQob25TdWJtaXQpfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxsYWJlbFxuICAgICAgICAgICAgICBodG1sRm9yPVwiZW1haWxcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDBcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBFbWFpbCBBZGRyZXNzXG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIGlkPVwiZW1haWxcIlxuICAgICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgICB7Li4ucmVnaXN0ZXIoXCJlbWFpbFwiLCB7XG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFwiRW1haWwgaXMgcmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZTogL15cXFMrQFxcUyskL2ksXG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlBsZWFzZSBlbnRlciBhIHZhbGlkIGVtYWlsXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZvcm0tY29udHJvbCAke2Vycm9ycy5lbWFpbCA/IFwiaXMtaW52YWxpZFwiIDogXCJcIn1gfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtlcnJvcnMuZW1haWwgJiYgKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJlcnJvci1tZXNzYWdlXCI+e2Vycm9ycy5lbWFpbC5tZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxsYWJlbFxuICAgICAgICAgICAgICBodG1sRm9yPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDBcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBQYXNzd29yZFxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICBpZD1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgey4uLnJlZ2lzdGVyKFwicGFzc3dvcmRcIiwge1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiBcIlBhc3N3b3JkIGlzIHJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgbWluTGVuZ3RoOiB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZTogOCxcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZm9ybS1jb250cm9sICR7ZXJyb3JzLnBhc3N3b3JkID8gXCJpcy1pbnZhbGlkXCIgOiBcIlwifWB9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2Vycm9ycy5wYXNzd29yZCAmJiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImVycm9yLW1lc3NhZ2VcIj57ZXJyb3JzLnBhc3N3b3JkLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPExpbmsgaHJlZj1cIi9mb3Jnb3QtcGFzc3dvcmRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXByaW1hcnktNjAwIGhvdmVyOnRleHQtcHJpbWFyeS01MDAgY3Vyc29yLXBvaW50ZXJcIj5cbiAgICAgICAgICAgICAgICBGb3Jnb3QgeW91ciBwYXNzd29yZD9cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2lzTG9hZGluZ31cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7aXNMb2FkaW5nID8gXCJMb2dnaW5nIGluLi4uXCIgOiBcIkxvZ2luXCJ9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cblxuICAgICAgICA8cCBjbGFzc05hbWU9XCJtdC02IHRleHQtY2VudGVyIHRleHQtc20gdGV4dC1ncmF5LTYwMFwiPlxuICAgICAgICAgIERvbiZhcG9zO3QgaGF2ZSBhbiBhY2NvdW50P3tcIiBcIn1cbiAgICAgICAgICA8TGluayBocmVmPVwiL3JlZ2lzdGVyXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LW1lZGl1bSB0ZXh0LXByaW1hcnktNjAwIGhvdmVyOnRleHQtcHJpbWFyeS01MDAgY3Vyc29yLXBvaW50ZXJcIj5cbiAgICAgICAgICAgICAgUmVnaXN0ZXJcbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L0xpbms+XG4gICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlRm9ybSIsInVzZUF1dGgiLCJMaW5rIiwiSGVhZCIsInVzZVJvdXRlciIsImdldENvb2tpZSIsImRlbGV0ZUNvb2tpZSIsIkxvZ2luIiwicmVnaXN0ZXIiLCJoYW5kbGVTdWJtaXQiLCJmb3JtU3RhdGUiLCJlcnJvcnMiLCJpc0xvYWRpbmciLCJzZXRJc0xvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwic3VjY2Vzc01lc3NhZ2UiLCJzZXRTdWNjZXNzTWVzc2FnZSIsInJvdXRlciIsImxvZ2dlZF9vdXQiLCJjYWxsYmFja1VybCIsInF1ZXJ5IiwiYXV0aCIsImxvY2FsU3RvcmFnZSIsInJlbW92ZUl0ZW0iLCJoYW5kbGVUb2tlbkNsZWFudXAiLCJjb25zb2xlIiwibG9nIiwicGF0aCIsInNldFRpbWVvdXQiLCJ1cmwiLCJVUkwiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJzZWFyY2hQYXJhbXMiLCJkZWxldGUiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwiZG9jdW1lbnQiLCJ0aXRsZSIsInRvU3RyaW5nIiwiY29va2llVG9rZW4iLCJsb2NhbFRva2VuIiwiZ2V0SXRlbSIsImRpcmVjdEVudHJ5IiwicmVmZXJyZXIiLCJpbmRleE9mIiwiaG9zdCIsIm9uU3VibWl0IiwiZGF0YSIsImxvZ2luIiwiZXJyIiwicmVzcG9uc2UiLCJkaXYiLCJjbGFzc05hbWUiLCJoMSIsImZvcm0iLCJsYWJlbCIsImh0bWxGb3IiLCJpbnB1dCIsImlkIiwidHlwZSIsInJlcXVpcmVkIiwicGF0dGVybiIsInZhbHVlIiwibWVzc2FnZSIsImVtYWlsIiwic3BhbiIsIm1pbkxlbmd0aCIsInBhc3N3b3JkIiwiYnV0dG9uIiwiZGlzYWJsZWQiLCJwIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/pages/login.js\n"));

/***/ })

});