from sqlalchemy import func, and_, case
from StudentManagement import db, app
from models import Student, Score, Student_Class, Class

def subject_summary_report(subject_id, semester_id):
    # Lấy danh sách tất cả các lớp
    class_list = db.session.query(Class.id, Class.name).all()

    report = []

    for class_id, class_name in class_list:
        # Tính điểm trung bình từng học sinh trong lớp đó
        results = db.session.query(
            Score.student_id,
            func.round(
                func.sum(
                    case(
                        (Score.score_type == 'DIEM_15', Score.score * 0.2),
                        (Score.score_type == 'DIEM_45', Score.score * 0.3),
                        (Score.score_type == 'DIEM_THI', Score.score * 0.5),
                        else_=0
                    )
                ) / func.sum(
                    case(
                        (Score.score_type == 'DIEM_15', 0.2),
                        (Score.score_type == 'DIEM_45', 0.3),
                        (Score.score_type == 'DIEM_THI', 0.5),
                        else_=0
                    )
                ), 2
            ).label('score_avg')
        ).join(
            Student_Class, Score.student_id == Student_Class.student_id
        ).filter(
            Student_Class.class_id == class_id,
            Score.subject_id == subject_id,
            Score.semester_id == semester_id
        ).group_by(
            Score.student_id
        ).all()

        total_students  = len(results)
        passed_students  = sum(1 for r in results if r.score_avg >= 5)
        pass_rate  = round((passed_students  / total_students ) * 100, 2) if total_students  > 0 else 0

        report.append({
            "class_id": class_id,
            "class_name": class_name,
            "total_students": total_students,
            "passed_students": passed_students,
            "pass_rate": pass_rate
        })
    print(report)
    return report
#
# with app.app_context():
#     subject_summary_report(1,1)