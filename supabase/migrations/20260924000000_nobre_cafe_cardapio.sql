-- Nobre Café cardápio completo
-- Atualizar produtos para cardápio específico do Nobre Café

-- Limpar produtos antigos (mantém histórico, apenas marca como inativo)
update public.products set active = false where active = true;

-- Inserir novos produtos do Nobre Café
insert into public.products
(legacy_id, category, name, description, price, cost, stock_qty, min_stock, active, tag)
values
-- PRATOS
('1', 'prato', 'Kibe Assado', 'Kibe tradicional assado na hora', 45, null, 10, 5, true, 'Especialidade'),
('2', 'prato', 'Risoto Brie com Parma', 'Risoto cremoso com brie e presunto de Parma', 85, null, 6, 3, true, 'Premium'),
('3', 'prato', 'Risoto Pera com Gorgonzola', 'Risoto elegante com pera fresca e queijo gorgonzola', 85, null, 5, 3, true, 'Premium'),
('4', 'prato', 'Ravioli Mussarela de Búfala', 'Ravioli fresco com mussarela de búfala e molho caseiro', 65, null, 8, 4, true, 'Premium'),

-- SOPAS E CALDOS
('5', 'sopa', 'Sopa de Cebola', 'Sopa francesa tradicional com cebola caramelizada', 35, null, 15, 8, true, 'Clássico'),

-- TORTAS
('6', 'tortas', 'Torta de Costela', 'Torta salgada com costela desfiada', 45, null, 6, 3, true, 'Especialidade'),
('7', 'tortas', 'Torta de Frango', 'Torta clássica de frango cremoso', 38, null, 8, 4, true, 'Mais Vendido'),
('8', 'tortas', 'Torta de Pupunha', 'Torta saudável com pupunha e vegetais', 38, null, 7, 4, true, null),

-- SALADAS E OMELETES
('9', 'salada', 'Salada Bistrô', 'Salada da casa com ingredientes frescos selecionados', 45, null, 10, 5, true, 'Mais Vendido'),
('10', 'salada', 'Omelete Francesa', 'Omelete francesa clássica com finas ervas', 29, null, 12, 6, true, null),

-- LANCHES
('11', 'lanches', 'Frango', 'Suco de frango grelhado no pão francês', 48, null, 15, 8, true, 'Mais Vendido'),
('12', 'lanches', 'Lanche de Abobrinha', 'Lanche vegetariano com abobrinha grelhada', 42, null, 8, 4, true, null),
('13', 'lanches', 'Pão na Chapa', 'Pão francês quentinho na chapa', 18, null, 20, 10, true, 'Rápido'),
('14', 'lanches', 'Misto', 'Lanche misto com presunto e queijo na chapa', 32, null, 12, 6, true, null),
('15', 'lanches', 'Croque Monsieur', 'Sanduíche francês com presunto e queijo gratinado', 35, null, 10, 5, true, 'Clássico'),

-- SOBREMESAS
('16', 'sobremesa', 'Brigadeiro', 'Brigadeiro tradicional', 6.50, null, 25, 12, true, 'Rápido'),
('17', 'sobremesa', 'Cookie', 'Cookie caseiro de chocolate', 15, null, 15, 8, true, null),
('18', 'sobremesa', 'Brownie', 'Brownie de chocolate belga', 15, null, 12, 6, true, null),
('19', 'sobremesa', 'Parfait de Frutas', 'Parfait gelado com frutas da estação', 28, null, 8, 4, true, 'Premium'),
('20', 'sobremesa', 'Torta de Limão', 'Torta de limão azedinho com merengue', 25, null, 6, 3, true, null),

-- BEBIDAS
('21', 'bebidas', 'Coca-Cola', 'Refrigerante Coca-Cola gelado', 12, null, 30, 15, true, null),
('22', 'bebidas', 'Coca-Cola Zero', 'Coca-Cola Zero lata', 12, null, 20, 10, true, null),
('23', 'bebidas', 'Sprite lata 350 ml', 'Sprite refrescante', 12, null, 25, 12, true, null),
('24', 'bebidas', 'Smirnoff Ice', 'Bebida gelada Smirnoff Ice', 15, null, 12, 6, true, null),
('25', 'bebidas', 'Guaraná Antarctica lata 350 ml', 'Guaraná Antarctica gelado', 12, null, 30, 15, true, null),
('26', 'bebidas', 'Guaraná Antarctica Zero lata 350 ml', 'Guaraná Zero sem açúcar', 12, null, 15, 8, true, null),
('27', 'bebidas', 'Água com Gás', 'Água mineral com gás', 6.85, null, 40, 20, true, 'Rápido'),
('28', 'bebidas', 'Suco Del Valle lata', 'Suco Del Valle de frutas variadas', 9.90, null, 20, 10, true, null),
('29', 'bebidas', 'Chá Leão Limão', 'Chá Leão sabor limão gelado', 9.90, null, 15, 8, true, null),
('30', 'bebidas', 'Energético', 'Bebida energética', 18, null, 10, 5, true, null),
('31', 'bebidas', 'Suco Natural', 'Suco natural feito na hora com frutas frescas', 20, null, 10, 5, true, 'Especialidade'),

-- DRINKS
('32', 'drinks', 'Gin e Tônica', 'Gin premium com tônica e limão', 32, null, 12, 6, true, 'Clássico'),
('33', 'drinks', 'Caipirinha', 'Caipirinha com limão fresco e cachaça', 32, null, 10, 5, true, 'Clássico'),
('34', 'drinks', 'Taça de Vinho', 'Vinho branco ou tinto selecionado', 20, null, 15, 8, true, 'Premium'),

-- CERVEJAS
('35', 'cerveja', 'Corona Extra Long Neck', 'Cerveja Corona Extra gelada', 17, null, 20, 10, true, 'Popular'),
('36', 'cerveja', 'Heineken Long Neck', 'Cerveja Heineken importada', 15, null, 18, 9, true, 'Popular'),
('37', 'cerveja', 'Stella Artois Long Neck', 'Cerveja Stella Artois premium', 15, null, 16, 8, true, null);

-- Criar índices para buscas rápidas
create index if not exists idx_products_active_category on public.products(active, category);
create index if not exists idx_products_price on public.products(price);
