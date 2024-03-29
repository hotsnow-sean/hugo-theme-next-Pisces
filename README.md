# hugo-theme-next-Pisces

复刻 hexo 的 Next 主题中的 Pisces 风格到 Hugo 下，用于博客迁移

复刻过程中减少了大量的配置判断，即“可配置性”降低，不过可以直接修改 html 模板来自定义，由于减少了大量其它风格的东西，很多配置也写死了，所以模板文件本身都很精简，很容易修改。

### 当前移植的情况

- 整体页面样式全部完成
- 页面动画完成，比较粗糙
- shortcodes(对应 hexo 中的 tags 插件)完成了 note、tabs、mermaid
- pjax 完成
- 本地搜索完成

### 使用方法

1. 根据 Hugo 官方教程建好站点目录
2. 克隆主题到 `themes` 文件夹
3. 参考 `exampleSite` 文件夹的内容进行配置
4. 没了。。

### Tips

- 博客文章必须位于 `content/posts` 目录
- `content` 文件夹下的其它文件或文件夹会使用默认模板展示，没有 `posts` 文章的特殊样式和功能
- `tags` 插件在 `Hugo` 下称为 `shortcodes`，使用时有两种形式：
  - `{{% shortcode %}}`
  - `{{< shortcode >}}`
    区别在于百分号的形式会将其包含的内容当作 markdown 进行渲染，而尖括号则直接将字符串本身输出（后者字符串中包含的 html 标签是起作用的）
- 能力有限，实现的 `tabs` 插件使用比较繁琐：

```
{{< tabs ID [TAB_NAME ...] >}}
{{% tab %}}
**** tab 1 text ****
{{% /tab %}}
{{% tab %}}
**** tab 2 text ****
{{% /tab %}}
...
{{< /tabs >}}
```

- `mermaid` 插件使用时算作数学公式，即文章必须开启了 `mathjax`，开启方法：只需要在文章头部配置中加入 `mathjax: true` 即可，数学公式的渲染依赖于这个选项的开启
- 依赖的第三方库有：`animate`, `pjax`, `fontawesome`, `pace`，它们对应的 js 和 css 文件的引入均位于以下两个文件（如若 cdn 地址失效，需要手动修改）：
  - `/layouts/_default/baseof.html` 文件的尾部
  - `/layouts/partials/head.html` 文件的尾部

### 完
