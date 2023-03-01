# Static Site Generation

## generateStaticParams() for route

1. background revaildate in [ISR function](https://vercel.com/docs/concepts/incremental-static-regeneration/overview) ([doc](https://beta.nextjs.org/docs/data-fetching/revalidating#background-revalidation))
    - 更新订阅(cron)
    - 全量更新route、folder
        - limit: 20 actions per request
        - <https://learn.microsoft.com/en-us/graph/json-batching>
        - <https://learn.microsoft.com/en-us/graph/api/driveitem-list-children?view=graph-rest-1.0&tabs=http>
        - filter: <https://learn.microsoft.com/en-us/graph/filter-query-parameter?tabs=http>
2. [on-demand revaildate](https://beta.nextjs.org/docs/data-fetching/revalidating#using-on-demand-revalidation)
    - 利用[通知事件](https://learn.microsoft.com/en-us/graph/webhooks?tabs=http)更新数据
    - diff changes
        - [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) and [Last-Modified](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Last-Modified) for each version for revalidation
        - 考虑使用edge config存StaticParams, onedrive只会通知update，不会通知具体受影响的文件
        - revalidate union of [prev StaticParams] & [current result], 不存在->`notFound()`

## 考虑page auth升级（不在page fetch里验证）

- 使用middleware？未授权跳转至login page
    - https://github.com/vvo/iron-session#nextjs-middlewares-usage
    - https://iron-session-example.vercel.app/
    - https://github.com/vercel/next.js/blob/canary/examples/with-iron-session/pages/index.tsx
- transverse时自动检测.password是否存在，保存在config中？

external link support for protected route via <https://github.com/vvo/iron-session#magic-links>

## generateStaticParams() 

等待nextjs升级，检查为何页面切换时会全量重新加载（可能SSG没有正常工作）

- [ ] refreshed config panel: 不需要重新部署
- 整体迁移至edge config+.env
- client secret/client id 存储在 edge config 中