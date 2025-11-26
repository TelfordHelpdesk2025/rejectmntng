<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        // COMMENT OUT IF NO SPECIFIC DEPT OR JOB TITLE
        if (
            session('emp_data') &&
            !in_array(session('emp_data')['emp_dept'], ['Quality Assurance']) &&
            !in_array(session('emp_data')['emp_jobtitle'], ['Senior QA Supervisor', 'QA Supervisor', 'QA Section Head', 'QA Sr. Section Head', 'QA Manager']) &&
            !in_array(session('emp_data')['emp_system_role'], ['superadmin', 'admin'])

        ) {
            session()->forget('emp_data');
            session()->flush();
            return redirect()->route('unauthorized');
        }

        return $next($request);
    }
}
