-- Nobre Café equipe com funcionários reais
-- Inserir funcionários específicos com dados fornecidos

-- Desativar funcionários antigos
update public.staff set active = false where active = true;

-- Inserir funcionários do Nobre Café
insert into public.staff
(name, role, phone, staff_type, active, credit_discount_rate, commission_rate)
values
('Alessandra Martins', 'salao', '5511976661112', 'salao', true, 20, 0),
('Andreia Moreira', 'salao', '5511981285148', 'salao', true, 20, 0),
('Viviane', 'salao', '5511986033844', 'salao', true, 20, 0),
('Cláudia Boldrin', 'salao', '5511999723525', 'salao', true, 20, 0),
('Chico', 'salao', '5511941713972', 'salao', true, 20, 0),
('Angela Teixeira', 'salao', null, 'salao', true, 20, 0),
('Nay', 'salao', null, 'salao', true, 20, 0),
('Nicoly', 'salao', null, 'salao', true, 20, 0),
('Júnior Sant''Anna', 'salao', null, 'salao', true, 20, 0),
('Jotha', 'salao', null, 'salao', true, 20, 0),
('João', 'salao', null, 'salao', true, 20, 0),
('Jéssica Rodilha', 'salao', null, 'salao', true, 20, 0),
('Jacque', 'salao', null, 'salao', true, 20, 0),
('Inez Menegon', 'salao', null, 'salao', true, 20, 0),
('Giovana', 'salao', null, 'salao', true, 20, 0),
('Fabrício Araújo', 'salao', null, 'salao', true, 20, 0),
('Daniela', 'salao', null, 'salao', true, 20, 0),
('Ariel', 'salao', null, 'salao', true, 20, 0),
('Roseane Silva', 'salao', null, 'salao', true, 20, 0),
('Gerente', 'gerente', null, 'gerente', true, 0, 0),
('Atendente', 'atendente', null, 'atendente', true, 0, 5);

-- Criar índices para buscas rápidas
create index if not exists idx_staff_active_name on public.staff(active, name);
create index if not exists idx_staff_phone on public.staff(phone);
