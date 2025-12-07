---
title: "TypeScriptの型定義テクニック"
description: "実務で使えるTypeScriptのUtility Typesや、少し高度な型定義のパターンを紹介します。"
pubDate: 2024-02-01
tags: ["TypeScript", "Tips", "Frontend"]
draft: false
---

TypeScriptを使っていると、型定義で悩むことがよくあります。

今回は、よく使うUtility Typesである `Pick`, `Omit`, `Partial` についてだけでなく、Conditional Typesを使った高度な型定義についても触れていきます。

## 基本的なUtility Types

### Pick

オブジェクト型から特定のプロパティだけを抽出します。

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

type UserSummary = Pick<User, 'id' | 'name'>;
// { id: string; name: string; }
```

### Omit

オブジェクト型から特定のプロパティを除外します。

```typescript
type UserWithoutId = Omit<User, 'id'>;
// { name: string; email: string; createdAt: Date; }
```

### Partial

すべてのプロパティをオプショナルにします。

```typescript
type PartialUser = Partial<User>;
// { id?: string; name?: string; email?: string; createdAt?: Date; }
```

## 高度なConditional Types

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type ExtractArrayType<T> = T extends (infer U)[] ? U : never;
```

## 型安全性の向上

適切な型定義を行うことで、実行時エラーを防ぎ、開発体験（DX）を大幅に向上させることができます。

TypeScriptの型システムをマスターすることで、より堅牢なコードを書くことができるようになります！
