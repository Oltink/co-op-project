def optimize_schedule(timetables, users):
    from collections import defaultdict, Counter

    result = []
    grouped = defaultdict(list)

    for t in timetables:
        key = f"{t['course']['_id']}_{t['professor']['_id']}"
        grouped[key].append(t)

    for key, slots in grouped.items():
        if len(slots) < 2:
            for s in slots:
                result.append({
                    "courseId": s['course']['_id'],
                    "courseName": s['course'].get('name', 'Unknown Course'),
                    "professorId": s['professor']['_id'],
                    "schedule": s['schedule']
                })
            continue

        students_groups = []
        for t in slots:
            group = [u for u in users if u['role'] == 'student' and t['_id'] in u.get('enrolledCourses', []) or t['course']['_id'] in u.get('enrolledCourses', [])]
            students_groups.append(group)

        sizes = [len(group) for group in students_groups]
        total = sum(sizes)

        if any(size < 15 for size in sizes) and total <= 35:
            all_slots = [(t['schedule']['day'], t['schedule']['time']) for t in slots]
            preferred_times = Counter(all_slots)
            most_common = preferred_times.most_common(1)[0][0] if preferred_times else ("Monday", "17:00")
            merged_day, merged_time = most_common

            seen_ids = set()
            merged_students = []
            for group in students_groups:
                for student in group:
                    if student['_id'] not in seen_ids:
                        seen_ids.add(student['_id'])
                        merged_students.append(student)

            conflict = False
            for student in merged_students:
                for t in result:
                    if (
                        t['courseId'] in student.get('enrolledCourses', []) and
                        t['schedule']['day'] == merged_day and
                        t['schedule']['time'] == merged_time
                    ):
                        conflict = True
                        break
                if conflict:
                    break

            if not conflict:
                course_name = slots[0]['course'].get('name', 'Unknown Course')
                result.append({
                    "courseId": slots[0]['course']['_id'],
                    "courseName": course_name,
                    "professorId": slots[0]['professor']['_id'],
                    "schedule": {
                        "day": merged_day,
                        "time": merged_time
                    }
                })
                continue

        for s in slots:
            result.append({
                "courseId": s['course']['_id'],
                "courseName": s['course'].get('name', 'Unknown Course'),
                "professorId": s['professor']['_id'],
                "schedule": s['schedule']
            })

    return result
