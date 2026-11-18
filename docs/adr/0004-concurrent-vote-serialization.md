# Database-level serialization and toggle semantics for polymorphic voting

Polymorphic voting on questions and answers is persisted in a unified database table using atomic upsert and toggle semantics inside a transaction.

Instead of managing in-memory vote counters, distributed Redis locks, or trusting client-side arithmetic, votes are recorded as unique `(student_id, target_type, target_id)` rows with values of `+1` or `-1`. Casting the same vote removes it (toggle to neutral), while reversing a vote updates the value. Vote scores are derived or atomically aggregated in SQL, preventing race conditions, double-voting, and score desynchronization under concurrent requests from the same student.
