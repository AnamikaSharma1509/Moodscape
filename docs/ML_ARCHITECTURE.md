# Machine Learning & Recommendation Architecture

## 1. Mathematical Formulation

### User Preference Vector Construction
Each of the 7 interactive quiz questions maps user choices to weighted dimensions across 16 genres and psychological states:
$$\vec{u}_{raw} = \sum_{i=1}^{7} \vec{w}(q_i, choice_i)$$

The raw vector is normalized to $[0, 1]$ via min-max scaling:
$$\vec{u} = \frac{\vec{u}_{raw}}{\max(\vec{u}_{raw})}$$

### Textual Feature Engineering
For each movie $m$ in the database, a combined textual corpus document $D_m$ is constructed:
$$D_m = \text{genres} \oplus \text{genres} \oplus \text{mood\_tags} \oplus \text{mood\_tags} \oplus \text{overview} \oplus \text{cast} \oplus \text{director} \oplus \text{category}$$

Repetition of genres and mood tags amplifies term frequency weights during TF-IDF vectorization.

### TF-IDF Vector Space
We use `scikit-learn`'s `TfidfVectorizer` with sublinear TF scaling and $(1, 2)$-gram features:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{1 + |D|}{1 + \text{DF}(t, D)}\right) + 1$$

Given user vector $\vec{u}$, a query token document $Q_u$ is formed with proportional token repetition. The content similarity is computed using Cosine Similarity:
$$\text{Sim}_{\text{content}}(Q_u, D_m) = \frac{\vec{v}_{Q_u} \cdot \vec{v}_{D_m}}{\|\vec{v}_{Q_u}\| \|\vec{v}_{D_m}\|}$$

### Transparent Hybrid Ranking Score
$$\text{Score}(m, u) = 0.50 \cdot \text{Sim}_{\text{content}} + 0.20 \cdot \text{Score}_{\text{genre}} + 0.15 \cdot \text{Score}_{\text{mood}} + 0.10 \cdot \text{Score}_{\text{rating}} + 0.05 \cdot \text{Score}_{\text{popularity}}$$

This ensures:
1. Personalization dominates popularity.
2. The user is recommended what matches their immediate emotional intent rather than what is merely trending.
3. Transparent percentage breakdowns are generated for the "Why this movie?" modal.
