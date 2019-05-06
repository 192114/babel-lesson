# babel 在webpack中的配置 [文档https://babeljs.io/docs/en/](https://babeljs.io/docs/en/)

## @babel/preset-env

babel-preset-env 是一系列插件的合集，官方已不用再使用 preset-201x 和 preset-latst 之类的包，env 包可以根据配置自动处理兼容代码

[文档https://babeljs.io/docs/en/babel-preset-env](https://babeljs.io/docs/en/babel-preset-env) 

- targets(针对你的项目指定生成的代码环境,个人喜欢将broswerslist配置在package.config中)
- loose(松散转换，默认false，推荐false)
- modules(将es6模块转换成其他模块类型,"amd" | "umd" | "systemjs" | "commonjs" | "cjs" | "auto" | false, defaults to "auto"，设置成false不进行转换，推荐设置成false)
- **useBuiltIns(这个选项配置了 @babel/preset-env 如何处理 polyfills,"usage" | "entry" | false， 默认是 false)**
  > 此选项将 core-js 模块直接引用为裸导入。因此，core-js 将相对于文件本身进行解析，并且是可被访问的。如果没有 core-js 依赖项或者有多个版本，您可能需要将 core-js@2 指定为应用程序中的顶级依赖项。
  - **useBuiltIns: 'entry'**
    - 需要在头部引入 '@babel/polyfill'，并且是根据配置环境引入对应的特性。代码中没有用到，但环境中会缺失，也会引入。（只根据 browserslist 配置）
      >只需要在你整个 app 中使用 require("@babel/polyfill"); / import '@babel/polyfill' 一次。多次对 @babel/polyfill 的导入会导致全局冲突和其他很难跟踪的错误。我们推荐创建一个单独的文件处理 require 语句。
  - **useBuiltIns: 'usage'**
    - 无需在头部引入 import '@babel/polyfill'，它会自动根据当前的代码引入对应特性，并且只引用代码中用到的特性（browserslist 配置 + 代码用到）
      > usage 风险项：由于我们通常会使用很多 npm 的 dependencies 包来进行业务开发，babel 默认是不会检测 依赖包的代码的。也就是说，如果某个 依赖包使用了 Array.from， 但是自己的业务代码没有使用到该API，构建出来的 polyfill 也不会有 Array.from， 如此一来，可能会在某些使用低版本浏览器的用户出现 BUG。所以避免这种情况发生，一般开源的第三方库发布上线的时候都是转换成 ES5 的。
  - **useBuiltIns: false**
    - 既不会在每个文件中自动添加 polyfill，也不会将 "@babel/polyfill" 导入为单个 polyfill。
- **corejs(决定当前 Babel 使用core-js的版本，有 2 和 3 选项)**
  - @babel/polyfill 移除了 polyfill proposals 所以 @babel/polyfill 仅仅是 core-js v2 的别名 因此我们只需要在项目中使用core-js即可
  - 推荐 corejs: 3 + useBuiltIns: 'entry'

    corejs: 2 + useBuiltIns: 'entry'产生警告
      ```sh
      `@babel/polyfill` is deprecated. Please, use required parts of `core-js` and `regenerator-runtime/runtime` separately
      ```

## @babel/polyfill(截至babel7.4.0,将会被弃用)
[文档https://babeljs.io/docs/en/next/babel-polyfill.html](https://babeljs.io/docs/en/next/babel-polyfill.html)
  - 以支持直接导入 core-js/stable（polyfill ECMAScript 特性）和 regenerator-runtime/runtime（需要使用转换后的 generator 函数）

  - babel-polyfill 的存在意义是给浏览器“打补丁”，比如浏览器没有 Object.assign 这个特性，它会针对这个环境创建这个特性。Babel 自身是只转换语法，不添加丢失的特性，polyfill 的存在就是弥补浏览器这部分缺失的特性（比如某些 ie）。

  - 副作用
    - 引入了新的全局对象，比如Promise、WeakMap等。
    - 修改现有的全局对象：比如修改了Array、String的原型链等。

    *在应用开发中，上述行为问题不大，基本可控。但如果在库、工具的开发中引入 babel-polyfill，则会带来潜在的问题。
    举个例子，在项目中定义了跟规范不一致的Array.from()函数，同时引入了一个库（依赖 babel-polyfill），此时，这个库可能覆盖了自定义的Array.from()函数，导致出错。
    这就是 babel-runtime 存在的原因。它将开发者依赖的全局内置对象等，抽取成单独的模块，并通过模块导入的方式引入，避免了对全局作用域的修改（污染）。
    因此，如果是开发库、工具，可以考虑使用 babel-runtime。*

## @babel/runtime
[文档https://babeljs.io/docs/en/babel-runtime](https://babeljs.io/docs/en/babel-runtime)
  - @babel/runtime 是一个包含 Babel modular runtime helpers 和 一系列 regenerator-runtime 的库。
  - 使用场景
    - 开发库/工具
    - 移除冗余工具函数(helper function)
  - *与 babel-polyfill 的区别在于*
    - *babel-polyfill 会修改（覆盖）实例方法，这在业务层很有用，但某些场景，比如引用外在的技术库，不希望这里的的 polyfill 覆盖业务代码中的方法*
    - *babel-runtime 不会修改实例方法，它只是引入一些 helper 函数，创造对应的方法*
  - 使用 babel-runtime 一般会搭配 babel-plugin-transform-runtime 使用。babel-plugin-transform-runtime 用于构建过程的代码转换，而 babel-runtime 是实际导入项目代码的功能模块。
  - 与@babel/runtime-corejs2或@babel/runtime-corejs3的区别：
    - 对于任何非实例方法，可以使用它来代替polyfill，它将使用core-js中的库函数替换Promise或Symbol之类的东西

## @babel/runtime-corejs2
[文档https://babeljs.io/docs/en/babel-runtime-corejs2](https://babeljs.io/docs/en/babel-runtime-corejs2)

## @babel/plugin-transform-runtime
[文档https://babeljs.io/docs/en/babel-plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)
  - babel 在每个需要的文件的顶部都会插入一些 helpers 内联代码，这可能会导致多个文件都会有重复的 helpers 代码。@babel/plugin-transform-runtime 的 helpers 选项就可以把这些模块抽离出来。
  -@babel/plugin-transform-runtime 主要做了三件事情：core-js aliasing、helper aliasing、regenerator aliasing
    - core-js aliasing：自动导入babel-runtime/core-js，并将全局静态方法、全局内置对象 映射到对应的模块。
    - helper aliasing：将内联的工具函数移除，改成通过babel-runtime/helpers模块进行导入，比如_classCallCheck工具函数。
    - regenerator aliasing：如果你使用了 async/generator 函数，则自动导入 babel-runtime/regenerator模块。

  ```js
    module.exports = {
      "plugins": [
          [
              "@babel/plugin-transform-runtime",
              {
                  "corejs": false, // boolean 或者 number, 默认 false，指定是否需要 runtime 的 corejs aliasing，如果使用 env 的 useBuiltIns + polyfill，使用 false。
                  "helpers": true, // boolean, 默认 true，指定是否内联 babel 的 helper 代码 (比如 classCallCheck, extends) 
                  "regenerator": false, // 通过 preset-env 已经使用了全局的 regeneratorRuntime, 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
                  "useESModules": true, // boolean, 默认 false，使用 es modules helpers, 减少 commonJS 语法代码
                  "absoluteRuntime": false // boolean, 默认 false，是否目录引用 runtime 包（有些项目会引用当前项目之外的代码，编译时会找不到 runtime 包）
              }
          ]
      ]
    }
  ```
## 小总结
- @babel/core（核心包）
- @babel/preset-env（预设）
- @babel/polyfill（v7.4.0似乎被废弃）
- @babel/runtime（开发业务代码可不用，开发技术库可以使用，提供helpers）
- @babel/plugin-transform-runtime（合并重复的 helper 函数)

- 别人家的配置
  ```js
    const presets = [
      [
        "@babel/env",
        {
          targets: {
            edge: "17",
            firefox: "60",
            chrome: "67",
            safari: "11.1",
            ie: '8'
          },
          useBuiltIns: 'usage',
          // Babel7 需要指定引入corejs的版本，最好使用3
          corejs: 3,
          modules: 'amd', // 需要转换成什么样的模块系统
        },
      ],
    ];
    
    const plugins = [
        // 帮助减少 helper 函数
        [
          "@babel/plugin-transform-runtime",
          {
              "corejs": false, // 默认值，可以不写
              "helpers": true, // 默认，可以不写
              "regenerator": false, // 通过 preset-env 已经使用了全局的 regeneratorRuntime, 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
              "useESModules": true, // 使用 es modules helpers, 减少 commonJS 语法代码
          }
        ],
        // 由于没有了 stage-x，需要单独导入需要的插件
        [
            '@babel/plugin-proposal-function-bind'
        ]
    ]
    module.exports = { presets, plugins };
  ```

# 配置大总结
- 最新ES 语法：比如，箭头函数
- 最新ES API：，比如，Promise
- 最新ES 实例方法：比如，String.protorype.includes

## @babel/preset-env + @babel/runtime + @babel/plugin-transform-runtime
  - 开发库/工具
  - 只转译最新ES 语法，比如，箭头函数
  - 比如最新ES API(Promise, Symbol)/最新ES 实例方法(String.protorype.includes)不做转译
  ```js
    {
      "presets": [
        ["@babel/preset-env", {
          "modules": false,
        }]
      ],
      "plugins": [
        "@babel/plugin-transform-runtime",
      ]
    }
  ```

## @babel/preset-env + @babel/runtime-corejs2(3) + @babel/plugin-transform-runtime
  - 相较于@babel/runtime，也转换最新ES API(Promise, Symbol)

--------------------------------------------------------------------------------------------
需要继续实验 不确定两个混用是否有效果
## @babel/preset-env + corejs3 + @babel/plugin-transform-runtime + @babel/runtime(提供helpers)
  - 适合具体的业务场景
  - ES语法、API、实例方法都进行转换
  ```js
    {
      "presets": [
        ["@babel/preset-env", {
          "modules": false,
          "useBuiltIns": "entry / usage",
          "corejs": 3,
        }]
      ],
      "plugins": [
        ["@babel/plugin-transform-runtime", {
          "corejs": false, // boolean 或者 number, 默认 false，指定是否需要 runtime 的 corejs aliasing，如果使用 env 的 useBuiltIns + polyfill，使用 false。
          "helpers": true, // boolean, 默认 true，指定是否内联 babel 的 helper 代码 (比如 classCallCheck, extends) 
          "regenerator": false, // 通过 preset-env 已经使用了全局的 regeneratorRuntime, 不再需要 transform-runtime 提供的 不污染全局的 regeneratorRuntime
          "useESModules": true, // boolean, 默认 false，使用 es modules helpers, 减少 commonJS 语法代码
          "absoluteRuntime": false // boolean, 默认 false，是否目录引用 runtime 包（有些项目会引用当前项目之外的代码，编译时会找不到 runtime 包）
        }]
      ]
    }
  ```