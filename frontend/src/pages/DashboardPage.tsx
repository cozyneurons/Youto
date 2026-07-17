import { useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import CourseGrid from '../components/dashboard/CourseGrid';
import RecentActivity from '../components/dashboard/RecentActivity';
import Loading from '../components/common/Loading';
import { useCourseStore } from '../store/courseStore';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { courses, isLoading, fetchCourses } = useCourseStore();

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <main className="container dashboard-main">
        <header className="dashboard-header">
          <h1 className="page-title">My Courses</h1>
          <Link to="/upload" id="new-course-btn" className="btn btn-primary btn-sm">
            + New Course
          </Link>
        </header>

        {isLoading ? (
          <Loading text="Loading your courses…" />
        ) : (
          <>
            <RecentActivity courses={courses} />
            <CourseGrid courses={courses} />
          </>
        )}
      </main>
    </div>
  );
}
