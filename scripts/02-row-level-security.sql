-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they're members of" ON public.projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = projects.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can update projects" ON public.projects FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Project owners can delete projects" ON public.projects FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Project members policies
CREATE POLICY "Users can view project members for projects they're in" ON public.project_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage members" ON public.project_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_members.project_id AND owner_id = auth.uid()
  )
);

-- Tasks policies
CREATE POLICY "Users can view tasks in their projects" ON public.tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = tasks.project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Project members can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = tasks.project_id AND user_id = auth.uid()
  ) AND auth.uid() = created_by
);

CREATE POLICY "Task creators and project owners can update tasks" ON public.tasks FOR UPDATE USING (
  created_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = tasks.project_id AND owner_id = auth.uid()
  )
);

-- CRITICAL: Only project owners can delete tasks
CREATE POLICY "Only project owners can delete tasks" ON public.tasks FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = tasks.project_id AND owner_id = auth.uid()
  )
);

-- Task comments policies
CREATE POLICY "Users can view comments on tasks they can see" ON public.task_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_members pm ON t.project_id = pm.project_id
    WHERE t.id = task_comments.task_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can add comments" ON public.task_comments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_members pm ON t.project_id = pm.project_id
    WHERE t.id = task_comments.task_id AND pm.user_id = auth.uid()
  ) AND auth.uid() = user_id
);

CREATE POLICY "Comment authors can update their comments" ON public.task_comments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Comment authors can delete their comments" ON public.task_comments FOR DELETE USING (user_id = auth.uid());

-- Task attachments policies
CREATE POLICY "Users can view attachments on tasks they can see" ON public.task_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_members pm ON t.project_id = pm.project_id
    WHERE t.id = task_attachments.task_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project members can upload attachments" ON public.task_attachments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_members pm ON t.project_id = pm.project_id
    WHERE t.id = task_attachments.task_id AND pm.user_id = auth.uid()
  ) AND auth.uid() = uploaded_by
);

CREATE POLICY "Attachment uploaders can delete their attachments" ON public.task_attachments FOR DELETE USING (uploaded_by = auth.uid());
