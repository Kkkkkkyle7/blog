---
title: '多臂老虎机问题（MAB）'
published: 2026-04-22
draft: false
description: '从问题定义、价值估计、增量更新到 epsilon-greedy，UCB 和 Thompson Sampling算法的多臂老虎机入门笔记。'
series: '强化学习课堂笔记'
tags: ['强化学习', 'bandit', '机器学习', 'epsilon-greedy', 'UCB' ,'Thompson Sampling']
---

## Definition

### MAB问题的形式化描述

对于 $k$ 臂老虎机，动作集合为 $\mathcal{A}=\{1,2,\dots,k\}$，在每个时刻 $t$，智能体选择一个动作 $A_t$ ，表示时刻 $t$ 实际拉动的 arm。随后环境返回 $t$ 时刻的奖励 $R_t\in\mathbb{R}$ 。

自然地对于任意固定动作 $a\in\mathcal A$，有 $Q(a) = \mathbb{E}(R_t \mid A_t = a)$ 是对于每个arm a的真实期望奖励，因此多臂老虎机的目标即为最大化 $T$ 时间段内累计期望奖励 $\max \mathbb{E}^\pi\sum_{t=1}^T R_t$

### 估计期望奖励

$$
\hat Q_t(a)=N_t^{-1}(a)\sum_{i=1}^t \mathbb{I}(A_i=a)R_i
$$

- $\hat Q_t(a)$：到时刻 $t$ 为止，我们对动作（arm）$a$ 的奖励均值估计。
- $N_t(a)=\sum_{i=1}^t \mathbb{I}(A_i=a)$：到时刻 $t$ 为止，动作 $a$ 一共被选中了多少次。
- 直观地，$\hat Q_t(a)=\frac{\text{arm } a \text{ 历史上得到的奖励总和}}{\text{arm } a \text{ 被选中的次数}}$

### 增量更新

如果 $t$ 时刻选择了a
$$
\begin{aligned}
\hat Q_{t+1}(a)&=\{N_t(a)+1\}^{-1}\left(\sum_{i=1}^t \mathbb{I}(A_i=a)R_i + R_{t+1}\right)\\
&=
\frac{N_t(a)}{N_t(a)+1}
\left\{
N_t^{-1}(a)\sum_{i=1}^t \mathbb{I}(A_i=a)R_i
\right\}
+ \frac{R_{t+1}}{N_t(a)+1}\\
&=\frac{N_t(a)}{N_t(a)+1}\hat Q_t(a) + \frac{R_{t+1}}{N_t(a)+1}
\end{aligned}
$$
非平稳环境下，考虑一个给定的步长参数

### 探索-利用

**探索**（exploration）是指尝试拉动更多可能的拉杆，这根拉杆不一定会获得最大的奖励，但这种方案能够摸清楚所有拉杆的获奖情况。

> 例如，对于一个 10 臂老虎机，我们要把所有的拉杆都拉动一下才知道哪根拉杆可能获得最大的奖励。

**利用**（exploitation）是指拉动已知期望奖励最大的那根拉杆，由于已知的信息仅仅来自有限次的交互观测，所以当前的最优拉杆不一定是全局最优的。

> 例如，对于一个 10 臂老虎机，我们只拉动过其中 3 根拉杆，接下来就一直拉动这 3 根拉杆中期望奖励最大的那根拉杆，但很有可能期望奖励最大的拉杆在剩下的 7 根当中，即使我们对 10 根拉杆各自都尝试了 20 次，发现 5 号拉杆的经验期望奖励是最高的，但仍然存在着微小的概率—另一根 6 号拉杆的真实期望奖励是比 5 号拉杆更高的。

于是在多臂老虎机问题中，设计策略时就需要平衡探索和利用的次数，不可能单独只探索或只利用，最终目的是使得累积奖励最大化。目前已有经典的算法包括$\varepsilon-$贪婪算法、上置信界算法和汤普森采样算法等。

------

## ε-greedy

每次以概率 $1-\varepsilon$ 选择 greedy policy：

$$
A_t = \arg\max_{a} \hat Q_{t-1}(a)
$$
以概率 $\varepsilon$ 随机选择一个arm a

### 算法伪代码

**输入：** 探索概率 $\varepsilon\in(0,1)$，总轮数 $T$，臂数 $k$

**初始化：**

对每个 $a\in\{1,2,\dots,k\}$，令
$$
\hat Q(a)\leftarrow 0,\qquad N(a)\leftarrow 0
$$
令 $t\leftarrow 0$

**循环执行直到 $t=T$：**

1. $t\leftarrow t+1$

2. 按 $\varepsilon$-贪心策略选择动作：

   - 以概率 $1-\varepsilon$，选择当前估计奖励最大的臂
     $$
     a^*\leftarrow \arg\max_{a}\hat Q(a)
     $$

   - 以概率 $\varepsilon$，从 $\{1,2,\dots,k\}$ 中随机选择一根臂

3. 拉动臂 $a^*$，获得奖励 $R$

4. 更新该臂的选择次数：
   $$
   N(a^*)\leftarrow N(a^*)+1
   $$

5. 更新该臂的估计期望奖励：
   $$
   \hat Q(a^*)\leftarrow \frac{N(a^*)-1}{N(a^*)}\hat Q_t(a) + \frac{1}{N(a^*)}R
   $$

------

## Upper Confidence Bound

探索准则（乐观准则）：看某个 arm 在乐观估计下最多可能有多好，因此每次选
$$
\arg\max_a \bigl[\underbrace{\hat{Q}_t(a)}_{\text{利用}}+\underbrace{U_t(a)}_{\text{探索}}\bigr]
$$

- $U_t(a)$：对arm $a$ 的**不确定性补偿项 / 置信上界 bonus**
  $$
  U_t(a)=\sqrt{\frac{c\log t}{N_t(a)}}
  $$
  试得越多，bonus 衰减越快；试得越少，bonus 越大

> Hoeffding's inequality
> $$
> \mathbb{P}\{\mathbb{E}[X]\geq \bar{x}_n + u\} \leq e^{-2nu^2}
> $$

因此有
$$
\Pr\big(Q(a)\le \hat Q_t(a)+U_t(a)\big)\ge 1-t^{-2c}.
$$
上界是随着$t\to\infty$，$1-t^{-2c}\to 1.$

### 算法伪代码

**输入：** 常数 \(c>0\)，总轮数 $T$，臂数 $k$

**初始化:**

对每个 $a\in\{1,2,\dots,k\}$，令
$$
\hat Q(a)\leftarrow 0,\qquad N(a)\leftarrow 0
$$
令 $t\leftarrow 0$

**循环执行直到 $t=T$：**

1. $t \leftarrow t+1$

2. 按 UCB 策略选择动作：

   - 选择上置信界最大的臂

   $$
        a^*\leftarrow \arg\max_a\left[\hat Q(a)+\sqrt{\frac{c\log t}{N(a)}}\right]
   $$

3. 拉动臂 $a^*$，获得奖励 $R$

4. 更新该臂的选择次数：
   \[
   N(a^*) \leftarrow N(a^*)+1
   \]

5. 更新该臂的估计期望奖励：
   \[
   \hat Q(a^*) \leftarrow \hat Q(a^*) + \frac{1}{N(a^*)}\bigl(R-\hat Q(a^*)\bigr)
   \]

------

## Thompson Sampling

对每个 arm 的真实奖励参数并不确定，因此先维护这个参数的后验分布；每一轮从后验分布中采样一个参数值，再选择采样值最大的 arm。

**贝叶斯学派**一脉相承的思想：先验分布的存在，这里是给奖励分布先建模后加先验分布

### Bernoulli Bandit

以Bernoulli Bandit为例：假设 arm a 的奖励分布是均值为 $\theta(a)$ 的伯努利分布，即
$$
R_t \mid A_t = a \sim Ber(\theta_a)
$$
给成功率 $\theta(a)$ 设 Beta 先验分布：
$$
\theta_a \sim Beta(\alpha, \beta)
$$

- Beta 分布适合做 Bernoulli 参数的先验，而且与 Bernoulli 分布是**共轭分布**，因此后验更新很方便。

贝叶斯法则更新后验：
$$
\theta(a)\mid \mathcal D \sim \mathrm{Beta}(S_a+\alpha,\;F_a+\beta)
$$

- $S_a$：arm $a$ 的成功次数

- $F_a$：arm $a$ 的失败次数
- 后验 = 先验信念 + 真实观测证据

对于 Bernoulli 分布，其期望为参数本身，因此动作价值为
$$
\mathbb E(R\mid A=a,\theta_t)=\theta_t(a)
$$

### 算法伪代码（Bernoulli-TS）

**输入：** 超参数 $\alpha,\beta>0$，总轮数 $T$

**初始化：** 对每个 $a\in\{1,2,\dots,k\}$，令
$$
S_a\leftarrow 0,\qquad F_a\leftarrow 0
$$
令 $t\leftarrow 0$

**循环执行直到 $t=T$：**

1. $t \leftarrow t+1$

2. 对每个 arm $a$，从其后验中采样（探索）
   $$
   \theta_a \sim \mathrm{Beta}(\alpha+S_a,\beta+F_a)
   $$

3. 选择后验采样值最大的臂（利用）
   $$
   a^*=\arg\max_a \theta_a
   $$

4. 拉动臂 $a^*$，获得奖励 $R$

5. 观察结果后更新 $S_a,F_a$

   - $R=1$，$S_a\leftarrow S_a + 1$
   - $R=0$，$F_a\leftarrow F_a + 1$

## Contextual Bandits

$S_t$: context; $A_t$: action; $R_t$: reward

### Personalized recommedation

$A_t \mid S_t$：根据$S_t$做推荐$A_t$

目标依然是 $\max \mathbb{E}\sum_{t=0}^T R_t$
