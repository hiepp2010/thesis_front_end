-- Insert sample users (these would normally be created through Supabase Auth)
INSERT INTO public.users (id, name, email, role, department, phone, avatar_url, availability) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 'john.doe@taskflow.com', 'Product Manager', 'Product', '+1 (555) 123-4567', '/abstract-geometric-shapes.png', 'Available'),
('550e8400-e29b-41d4-a716-446655440002', 'Alex Johnson', 'alex.johnson@taskflow.com', 'UI/UX Designer', 'Design', '+1 (555) 234-5678', '/diverse-person-portrait.png', 'In a meeting'),
('550e8400-e29b-41d4-a716-446655440003', 'Sarah Williams', 'sarah.williams@taskflow.com', 'Frontend Developer', 'Engineering', '+1 (555) 345-6789', '/diverse-group-conversation.png', 'Available'),
('550e8400-e29b-41d4-a716-446655440004', 'Michael Brown', 'michael.brown@taskflow.com', 'Backend Developer', 'Engineering', '+1 (555) 456-7890', '/diverse-group-meeting.png', 'Busy'),
('550e8400-e29b-41d4-a716-446655440005', 'Emily Davis', 'emily.davis@taskflow.com', 'Content Strategist', 'Marketing', '+1 (555) 567-8901', '/diverse-group-five.png', 'Available');

-- Insert sample projects
INSERT INTO public.projects (id, name, description, progress, status, due_date, owner_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Website Redesign', 'Redesign the company website with new branding', 65, 'in-progress', '2025-06-30', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'Mobile App Development', 'Create a new mobile app for customer engagement', 25, 'planning', '2025-08-15', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440003', 'Brand Guidelines', 'Develop comprehensive brand guidelines for marketing', 100, 'completed', '2025-05-10', '550e8400-e29b-41d4-a716-446655440002');

-- Insert project members
INSERT INTO public.project_members (project_id, user_id, role) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'member'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'member'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 'member');

-- Insert sample tasks
INSERT INTO public.tasks (id, title, description, status, priority, assignee_id, project_id, due_date, tags, completed_percentage, created_by) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Create wireframes for homepage', 'Design initial wireframes for the new homepage layout', 'todo', 'medium', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '2025-05-28', '{"Design"}', 0, '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Set up development environment', 'Configure development environment for the new website', 'todo', 'low', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '2025-05-25', '{"Development"}', 0, '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', 'Update homepage hero section', 'Redesign the hero section with new branding elements', 'in-progress', 'medium', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '2025-05-25', '{"Design"}', 65, '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440004', 'Create responsive navigation', 'Develop a responsive navigation menu for all devices', 'in-progress', 'high', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '2025-05-28', '{"Development"}', 40, '550e8400-e29b-41d4-a716-446655440001');
