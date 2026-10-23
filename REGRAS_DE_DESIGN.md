# Documento de Direção Visual e UX — Sistema de Gerenciamento de Condomínio

## 1. Objetivo do projeto

Reorganizar e aprimorar a interface do sistema de gerenciamento de condomínio, aplicando uma identidade visual consistente, moderna, profissional e intuitiva, utilizando as imagens de referência como inspiração.

O objetivo não é reconstruir o sistema do zero nem substituir todos os componentes existentes. A proposta é melhorar a apresentação das informações, reduzir a repetição visual, organizar melhor os conteúdos e facilitar as operações realizadas pelos administradores e moradores.

O sistema deve transmitir organização, confiança, clareza e praticidade. A interface precisa ser agradável e moderna, mas também funcional para o uso cotidiano.

**Prioridades do redesign:**
- Criar uma identidade visual única para todo o sistema.
- Diferenciar claramente as experiências de administrador e morador.
- Reduzir a quantidade excessiva de cards e informações repetidas.
- Preservar tabelas sempre que forem a melhor opção para consultar, comparar e administrar dados.
- Melhorar a hierarquia visual, os espaçamentos e a organização das páginas.
- Padronizar botões, formulários, filtros, tabelas, modais e indicadores de status.
- Facilitar ações frequentes, como publicar avisos, cadastrar moradores e registrar pagamentos.
- Preservar as funcionalidades e as regras de negócio já existentes.

## 2. Referências visuais e padrões que devem ser aproveitados

As imagens fornecidas devem ser utilizadas como referências complementares. A intenção é combinar os melhores elementos de cada uma, sem copiar integralmente nenhum layout.

### 2.1. Identidade visual e organização do painel

A referência do painel educacional serve como inspiração para:
- Utilização de uma cor primária roxa ou violeta.
- Fundo em tons claros e neutros.
- Navegação lateral organizada.
- Uso equilibrado de áreas de destaque e espaços em branco.
- Componentes com cantos arredondados.
- Hierarquia clara entre títulos, descrições, ações e informações secundárias.

O sistema de condomínio deve adotar uma aparência mais administrativa e profissional, evitando excesso de gradientes, ilustrações decorativas ou elementos que concorram com as informações operacionais.

### 2.2. Organização administrativa

A referência da tela de anúncios administrativos deve orientar:
- Títulos grandes e bem definidos.
- Botão de ação principal no topo da página, como “Novo aviso”.
- Tabelas organizadas e legíveis.
- Ações secundárias agrupadas em menus de opções quando apropriado.
- Formulários em modais para tarefas pontuais, evitando navegações desnecessárias.
- Uso de um fundo discretamente escurecido ao abrir um modal.

Esse padrão deve ser aplicado às telas administrativas, mantendo a navegação consistente entre avisos, casas, moradores e pagamentos.

### 2.3. Informações financeiras e detalhes das casas

A referência de gerenciamento de imóveis deve inspirar:
- Apresentação dos dados principais em uma área resumida.
- Separação entre informações gerais e informações específicas de cada casa.
- Destaque para valores financeiros e indicadores importantes.
- Identificação clara de receitas, despesas, pendências e valores líquidos, quando esses dados já fizerem parte do sistema.
- Uso de seções para organizar informações relacionadas.

Nem toda informação precisa estar dentro de um card. Dados cadastrais podem ser apresentados em seções com rótulos e valores, enquanto indicadores importantes podem utilizar cards compactos.

### 2.4. Inventário de quartos e status operacionais

A referência do inventário de quartos serve como inspiração para:
- Identificação rápida do status por meio de cores e rótulos.
- Filtros para alternar entre categorias ou situações.
- Pesquisa por nome ou número.
- Menus de ações secundárias.
- Uso de cards apenas quando eles facilitarem a leitura individual dos itens.

Esse padrão pode ser adaptado à listagem de casas e aos status de pagamentos, sem transformar cada registro em um card desnecessariamente.

### 2.5. Painéis com indicadores e tabelas

As referências de dashboards devem orientar a combinação de:
- Indicadores resumidos.
- Tabelas para informações detalhadas.
- Filtros próximos ao conteúdo filtrado.
- Gráficos somente quando ajudarem a identificar tendências ou comparar períodos.
- Listas compactas para os itens mais recentes ou mais relevantes.

A interface deve priorizar informações úteis para a tomada de decisão, evitando gráficos decorativos e indicadores que não contribuam para a operação do condomínio.

## 3. Identidade visual do sistema

### 3.1. Paleta de cores

Adotar uma paleta baseada em tons neutros, com roxo como cor principal e cores semânticas para indicar estados.

- **Cor primária:** roxo ou violeta, utilizado em botões principais, links ativos, elementos selecionados e destaques de navegação.
- **Fundo geral:** cinza muito claro ou branco levemente acinzentado.
- **Superfícies:** branco para tabelas, formulários, modais e áreas de conteúdo.
- **Texto principal:** azul-marinho muito escuro ou grafite, garantindo alto contraste.
- **Texto secundário:** cinza médio para descrições, datas, legendas e informações complementares.
- **Bordas:** cinza-claro, discretas e consistentes.
- **Verde:** pagamentos confirmados, operações concluídas e estados positivos.
- **Amarelo ou âmbar:** itens pendentes, avisos de atenção e vencimentos próximos.
- **Vermelho:** pagamentos atrasados, erros e ações potencialmente destrutivas.
- **Azul ou ciano:** informações neutras e avisos informativos, quando necessário.

Utilizar as cores semânticas de forma consistente. A cor não deve ser o único recurso para transmitir um status: adicionar também um texto ou ícone identificador.

Evitar utilizar muitas cores simultaneamente. O roxo deve estabelecer a identidade visual, enquanto as demais cores devem comunicar estados ou situações específicas.

### 3.2. Tipografia

Utilizar uma fonte sem serifa moderna e legível, preferencialmente Inter ou uma fonte equivalente já disponível no projeto.

Estabelecer uma hierarquia consistente:
- Título principal da página: destaque visual claro.
- Títulos de seções: tamanho intermediário e peso semibold.
- Nomes de registros e informações importantes: peso regular ou semibold.
- Rótulos e descrições: tamanho menor, mantendo legibilidade.
- Valores financeiros: destaque proporcional à importância da informação.
- Informações auxiliares: menor contraste, sem comprometer a leitura.

Evitar títulos excessivamente grandes, variação desnecessária de tamanhos e uso indiscriminado de negrito.

### 3.3. Bordas, sombras e espaçamento

Adotar:
- Cantos arredondados moderados e consistentes.
- Bordas finas para delimitar áreas quando necessário.
- Sombras suaves somente em componentes que precisam se destacar do fundo.
- Espaçamentos uniformes entre títulos, seções, campos e componentes.
- Alinhamento consistente dos elementos nas diferentes páginas.

Evitar sombras pesadas, bordas coloridas excessivas e arredondamentos diferentes para componentes equivalentes.

O objetivo é construir uma interface leve e organizada, não um conjunto de caixas independentes.

## 4. Navegação conforme o tipo de usuário

O sistema possui dois perfis: administrador e morador. Cada um deve visualizar somente as funcionalidades correspondentes às suas permissões.

### 4.1. Administrador

O administrador terá uma estrutura de navegação consistente, preferencialmente com menu lateral fixo em telas grandes.

O menu deve conter apenas os módulos administrativos existentes no sistema e os necessários para as funcionalidades previstas:
- Inicial / Dashboard.
- Avisos.
- Casas.
- Moradores.
- Pagamentos, caso seja necessário um acesso administrativo dedicado a esse módulo.

A navegação deve destacar visualmente a página atual. Ícones podem acompanhar os nomes dos itens, desde que sejam consistentes e facilmente reconhecíveis.

Em telas menores, o menu deve poder ser recolhido ou convertido em uma navegação adequada ao espaço disponível.

Não criar módulos ou páginas adicionais sem necessidade funcional. Cadastro e baixa de pagamentos podem ser realizados dentro dos módulos correspondentes por meio de formulários, modais ou painéis laterais.

### 4.2. Morador

O morador possui somente três telas:
1. Tela inicial.
2. Tela de avisos.
3. Tela de pagamentos.

A tela inicial não deve possuir menu lateral nem a estrutura administrativa completa. Ela deve ser simples, acolhedora e objetiva, permitindo ao morador acessar rapidamente os dois módulos disponíveis.

Na tela inicial, apresentar:
- Uma saudação personalizada, quando houver dados disponíveis.
- Dois atalhos principais em destaque: “Avisos” e “Pagamentos”.
- Informações resumidas realmente úteis, como quantidade de avisos recentes ou situação dos pagamentos, se esses dados já estiverem disponíveis.
- Uma hierarquia visual que priorize os dois atalhos, sem sobrecarregar o espaço.

Os atalhos podem utilizar cards compactos, botões ou blocos clicáveis. Deve-se escolher o formato que melhor se integrar à identidade visual, sem adicionar vários cards redundantes.

As telas de avisos e pagamentos devem manter uma navegação simples, com uma forma clara de voltar à tela inicial. Não introduzir novas seções de navegação para o morador.

Todas as funcionalidades e dados devem respeitar as permissões de cada perfil. O morador não pode acessar operações administrativas por alteração da URL ou por outros meios.

## 5. Tela inicial do administrador — Dashboard mensal

### Objetivo

Apresentar uma visão geral do mês do condomínio, permitindo ao administrador consultar rapidamente a situação das casas e navegar entre diferentes períodos.

### Organização visual

No topo da página:
- Título “Dashboard” ou “Visão geral”.
- Descrição curta e discreta, se contribuir para o entendimento.
- Seletor de mês e ano, com possibilidade de consultar períodos anteriores.
- Ações relacionadas ao contexto, somente quando necessárias.

O seletor de período deve ser facilmente identificado e aplicado de maneira consistente a todos os dados mensais da tela que dependam dessa seleção.

### Indicadores resumidos

Apresentar apenas os principais indicadores do período, de acordo com os dados disponíveis no sistema. Exemplos:
- Total de casas.
- Total de pagamentos registrados.
- Total recebido no período.
- Total pendente ou em atraso.

Esses indicadores podem ser apresentados em uma faixa compacta de cards ou em outro componente resumido. Não criar um card para cada métrica existente no banco de dados.

Os indicadores precisam corresponder ao período selecionado e utilizar os mesmos critérios de cálculo já adotados pela aplicação.

Não inventar valores, cálculos financeiros, dados fictícios ou novas regras de negócio.

### Tabela mensal das casas

A tabela deve ser o elemento central da página, pois permite comparar diversos registros sem ocupar espaço desnecessário.

Ela deve apresentar somente as informações importantes para a consulta mensal. A estrutura exata das colunas deve respeitar os dados já existentes no sistema. Como referência, podem ser consideradas:
- Casa ou identificação da unidade.
- Morador ou responsável, quando aplicável.
- Valor previsto.
- Valor recebido.
- Situação do pagamento.
- Data relevante para a operação.

Não adicionar todas essas colunas automaticamente. Selecionar apenas as que correspondem às regras e informações existentes.

A tabela deve oferecer:
- Cabeçalho claro.
- Alinhamento adequado dos textos e valores.
- Status identificados por rótulos.
- Ordenação quando útil.
- Filtros aplicáveis aos registros.
- Indicação de carregamento, ausência de resultados e falha de carregamento.
- Paginação quando o volume de dados justificar.

O filtro de mês e ano deve ser aplicado à tabela. Filtros complementares, como status, podem ficar próximos à pesquisa ou ao cabeçalho da tabela.

Em telas pequenas, a tabela deve se adaptar sem causar quebra descontrolada do layout. É permitido utilizar rolagem horizontal ou uma apresentação compacta por registro, conforme a quantidade de informações.

### Gráficos

Utilizar gráficos somente quando houver uma necessidade real de visualizar a evolução dos valores recebidos, das pendências ou de outro indicador ao longo do tempo.

Não adicionar gráficos apenas por razões estéticas. A tabela mensal continua sendo a principal ferramenta de consulta detalhada.

## 6. Tela de avisos do administrador

### Objetivo

Permitir que o administrador consulte, organize e publique comunicados do condomínio.

### Layout

Apresentar:
- Título “Avisos”.
- Botão principal “Novo aviso”, no topo da página.
- Campo de pesquisa, caso exista volume relevante de registros.
- Filtros úteis, como status ou período, se compatíveis com os dados existentes.
- Lista ou tabela de avisos publicados e de outros estados que o sistema suporte.

A listagem deve facilitar a localização de um aviso sem apresentar informações repetidas em vários cards.

Para cada registro, exibir as informações essenciais, como título, data e situação. O conteúdo completo pode ser consultado por meio da ação de visualização.

As ações secundárias podem ser agrupadas em um menu de opções, quando isso reduzir a poluição visual. Ações importantes não devem ficar escondidas de maneira que prejudiquem a usabilidade.

### Cadastro e publicação de avisos

A criação de um aviso deve utilizar um modal ou painel lateral, seguindo a referência de formulário sobreposto às listagens administrativas.

O formulário deve conter os campos já suportados pelo sistema, como título, conteúdo e eventuais configurações de publicação.

Caso o sistema possua anexos, manter a funcionalidade de envio de arquivos e apresentar os arquivos selecionados de forma clara.

O modal deve possuir:
- Título indicando a operação.
- Campos com rótulos objetivos.
- Indicação clara de campos obrigatórios.
- Botão para cancelar ou fechar.
- Botão principal para publicar ou salvar, conforme a operação.
- Validações próximas aos campos.
- Proteção contra envio repetido durante o processamento.

Se houver suporte a rascunhos, agendamento ou confirmação de leitura, manter esses recursos. Não introduzir tais funcionalidades como se já existissem.

Ao fechar um formulário com alterações não salvas, solicitar confirmação quando houver risco de perda de conteúdo.

## 7. Tela de casas — Visão geral

### Objetivo

Permitir que o administrador consulte todas as casas cadastradas e acesse os detalhes de cada uma.

### Organização visual

No topo:
- Título “Casas”.
- Botão “Nova casa” somente se o cadastro já fizer parte das funcionalidades previstas.
- Campo de pesquisa por identificação da casa ou outro dado disponível.
- Filtros úteis, como situação de ocupação, quando suportados pelo sistema.

A listagem geral deve preferencialmente utilizar uma tabela para manter a comparação rápida entre os registros.

Cada linha deve apresentar informações essenciais, como:
- Identificação da casa.
- Morador ou responsável, quando houver.
- Situação de ocupação ou cadastro.
- Informação financeira resumida, quando pertinente e disponível.
- Ação para visualizar detalhes.

Não transformar cada casa em um card grande apenas para acomodar essas informações. Cards podem ser considerados em telas pequenas, se melhorarem a leitura.

Status como ocupada, desocupada ou outra condição devem refletir exclusivamente os estados existentes no sistema.

### Detalhes de uma casa

A página ou visualização de detalhes deve organizar os dados por assunto, sem dividir cada campo em um card independente.

Estrutura sugerida:

**Informações gerais:** identificação da casa e os demais dados cadastrais existentes.

**Moradores:** pessoas vinculadas à casa, quando o relacionamento estiver disponível.

**Financeiro:** informações relacionadas aos pagamentos da unidade, organizadas de forma cronológica ou por período, conforme o modelo de dados atual.

**Histórico:** registros relevantes de alterações ou operações, somente se já forem armazenados pelo sistema.

Os campos e as relações devem respeitar o modelo de dados existente. Não criar informações, históricos ou vínculos inexistentes apenas para preencher o layout.

A navegação deve apresentar uma forma clara de retornar à listagem geral.

## 8. Cadastro de moradores

### Objetivo

Criar ou aprimorar a interface que permite ao administrador cadastrar e manter os dados dos moradores vinculados ao condomínio.

O cadastro deve ser um formulário organizado e fácil de preencher. A preferência é dividir os campos em grupos lógicos dentro de um mesmo formulário, evitando que cada grupo se transforme em uma página ou card desnecessário.

### Organização sugerida

**Dados pessoais:** nome completo e demais informações pessoais que o sistema já suporta.

**Contato:** e-mail, telefone e outros canais disponíveis no modelo de dados.

**Vínculo com o condomínio:** casa ou unidade relacionada e tipo de vínculo, se aplicável.

**Acesso ao sistema:** informações necessárias à conta do morador, de acordo com a autenticação e as regras de segurança já implementadas.

Não solicitar senhas em texto visível nem expor credenciais. A criação de acesso deve utilizar o mecanismo de autenticação já existente.

A seleção da casa deve utilizar um componente de pesquisa ou seleção quando houver várias unidades. Devem ser respeitadas as regras existentes para relacionamentos e ocupação.

Os campos obrigatórios precisam estar identificados e validados. Mensagens de erro devem indicar o que precisa ser corrigido sem apagar os dados já preenchidos.

O formulário pode aparecer em um modal, painel lateral ou página própria. Escolher a solução com base no tamanho e na complexidade reais do cadastro.

Para operações de edição, reutilizar o mesmo padrão visual, preenchendo os campos com os dados atuais.

## 9. Pagamentos e baixa de pagamentos

### Objetivo

Facilitar a consulta dos pagamentos e permitir que o administrador registre a confirmação de um recebimento.

### Exibição dos pagamentos

Quando houver uma listagem administrativa específica de pagamentos, priorizar uma tabela com informações como:
- Casa ou unidade relacionada.
- Morador ou responsável, se aplicável.
- Valor.
- Vencimento.
- Data de pagamento, quando existente.
- Situação atual.
- Ações disponíveis.

Esses campos são referências de organização, não uma determinação para alterar o modelo de dados. Utilizar apenas as informações e os relacionamentos presentes no sistema.

Filtros por período e situação podem ser disponibilizados quando forem úteis. As pesquisas e os filtros devem permitir localizar rapidamente registros específicos.

### Registrar a baixa de um pagamento

A operação de baixa deve ser fácil de localizar e apresentar somente quando fizer sentido para o estado atual do registro.

Ao selecionar “Registrar pagamento” ou “Dar baixa”, abrir um modal ou painel lateral para confirmar os dados da operação.

A interface deve exibir as informações pertinentes ao pagamento selecionado e solicitar apenas os dados necessários à operação, conforme as regras atuais. Por exemplo, a data do recebimento, se esse campo fizer parte do fluxo existente.

Antes de confirmar, o usuário deve conseguir identificar qual pagamento está alterando.

A confirmação deve:
- Validar os dados exigidos.
- Informar que a operação está sendo processada.
- Evitar envios duplicados.
- Atualizar a situação do registro após o sucesso.
- Mostrar uma mensagem clara de confirmação.
- Apresentar erros de forma compreensível quando a operação falhar.

Se o pagamento já estiver confirmado, a ação de baixa não deve continuar disponível de maneira que provoque duplicação ou alteração indevida. O comportamento deve respeitar as regras de negócio atuais.

Se houver possibilidade de estorno ou correção, manter os mecanismos existentes e respeitar as permissões administrativas. Não criar operações financeiras novas sem especificação.

### Tela de pagamentos do morador

O morador deve visualizar apenas os pagamentos aos quais tem autorização de acesso.

A apresentação deve destacar:
- Valor e vencimento.
- Situação do pagamento.
- Data de pagamento, quando registrada.
- Outras informações úteis já disponíveis.

Os registros podem ser apresentados como linhas compactas ou blocos simples, dependendo da quantidade de dados e da experiência em dispositivos móveis.

O objetivo é facilitar a consulta, não reproduzir o painel administrativo em versão reduzida.

O morador não deve ter acesso à ação administrativa de dar baixa nem a pagamentos de outras casas.

## 10. Redução do excesso de cards e tabelas

Este é um dos requisitos centrais do redesign.

O sistema possui muitos cards e tabelas. A solução não é remover todos eles, mas escolher a melhor forma de exibição conforme o objetivo de cada componente.

### Quando utilizar cards

Utilizar cards principalmente para:
- Indicadores resumidos do dashboard.
- Atalhos para as principais funcionalidades do morador.
- Elementos independentes que precisem de identificação visual própria.
- Grupos de dados que realmente funcionem como unidades independentes.

Evitar:
- Criar um card para cada campo cadastral.
- Colocar uma tabela dentro de vários cards sem necessidade.
- Repetir os mesmos valores em um indicador e em diversas seções adjacentes.
- Utilizar cards grandes para listas extensas de registros semelhantes.
- Inserir bordas e sombras em todas as áreas da tela.

### Quando utilizar tabelas

Utilizar tabelas principalmente para:
- Listagem de casas.
- Resumo mensal.
- Consulta de pagamentos.
- Histórico de avisos ou outros registros administrativos, quando a comparação em colunas for útil.

Tabelas favorecem a comparação de informações e permitem exibir vários registros de maneira compacta.

### Quando utilizar seções simples

Informações cadastrais, detalhes de uma casa e dados de um morador devem ser organizados em seções com títulos, rótulos e valores, sem a necessidade de transformar cada grupo em um card destacado.

Utilizar divisores discretos e espaçamento consistente para separar os assuntos.

**Regra geral:** escolher o componente mais simples que permita compreender e executar a tarefa. Evitar componentes decorativos, informações duplicadas e caixas sem uma função clara.

## 11. Padrões para componentes e interações

Todos os módulos devem seguir os mesmos padrões visuais e comportamentais.

### Botões

Definir padrões consistentes para:
- Ação principal: usar a cor primária.
- Ação secundária: utilizar estilo neutro ou contornado.
- Ação destrutiva: utilizar uma identificação visual de risco.
- Ícones sem texto: apresentar identificação acessível e dica de contexto quando necessário.

Manter os botões com altura, espaçamento, tipografia e comportamento consistentes.

### Formulários

Os formulários devem apresentar:
- Rótulos visíveis.
- Campos com dimensões consistentes.
- Indicação de obrigatoriedade.
- Mensagens de validação claras.
- Estados de foco e erro.
- Botões de ação próximos ao final do formulário.

Não utilizar textos de exemplo como substitutos permanentes dos rótulos.

### Modais

Utilizar modais para tarefas pontuais que possam ser realizadas sem perder o contexto da página, como publicação de aviso ou confirmação de baixa de pagamento.

Evitar modais extensos ou aninhados. Se o formulário exigir muitas informações, considerar uma página ou painel lateral.

### Tabelas

Padronizar cabeçalho, linhas, espaçamento, alinhamento, status e menus de ações.

Quando aplicável, disponibilizar pesquisa, filtros, ordenação e paginação. Essas funções devem ser implementadas conforme as necessidades dos dados, e não adicionadas indiscriminadamente.

### Feedback visual

Ações importantes devem gerar feedback claro:
- Sucesso após salvar ou atualizar.
- Erro quando a operação falhar.
- Carregamento durante operações assíncronas.
- Estado vazio quando não houver registros.
- Confirmação antes de operações destrutivas ou irreversíveis.

Os feedbacks devem ser discretos e seguir a identidade visual.

### Estados dos componentes

Considerar os estados normal, hover, foco, desabilitado, carregamento, sucesso, vazio e erro, conforme aplicável.

Não deixar botões com aparência interativa quando não executam nenhuma ação. Elementos que realizam navegação devem se comportar como links; ações de alteração devem utilizar controles adequados.

## 12. Responsividade e acessibilidade

O layout deve funcionar em computadores, tablets e dispositivos móveis.

Em telas grandes:
- Priorizar o uso eficiente da largura disponível.
- Manter o menu administrativo estável.
- Exibir tabelas e informações detalhadas com boa legibilidade.
- Evitar espaços vazios excessivos e conteúdo excessivamente espalhado.

Em telas menores:
- Adaptar ou recolher a navegação administrativa.
- Ajustar os formulários à largura da tela.
- Evitar que botões importantes fiquem inacessíveis.
- Permitir a consulta das tabelas sem comprometer o conteúdo.
- Manter os atalhos do morador visíveis e fáceis de utilizar.

Garantir contraste adequado, foco visível para navegação por teclado, rótulos associados aos campos e identificação textual dos status.

Ícones devem ser familiares e consistentes. Não depender exclusivamente de cor, posição ou formato para transmitir informações importantes.

## 13. Regras para a implementação

A IA responsável pela aplicação do redesign deve seguir as seguintes diretrizes:

1. Analisar a estrutura atual do projeto antes de modificar os arquivos.
2. Identificar as tecnologias, os componentes reutilizáveis, as rotas, os modelos de dados e as permissões já implementadas.
3. Reaproveitar os componentes existentes quando estiverem adequados.
4. Criar ou ajustar componentes compartilhados para evitar estilos divergentes entre as páginas.
5. Preservar as regras de negócio, a autenticação, a autorização, as validações e a integração com o backend.
6. Não substituir funcionalidades reais por dados fictícios ou interações apenas visuais.
7. Não renomear campos, rotas, entidades ou propriedades da API sem necessidade comprovada.
8. Não alterar o modelo de dados ou as regras financeiras apenas para adequá-los à apresentação visual.
9. Não duplicar funcionalidades que já existam em outro módulo.
10. Não criar novas telas, indicadores, gráficos ou ações sem uma necessidade identificada.
11. Manter os dois perfis de acesso separados, tanto visualmente quanto em termos de permissão.
12. Aplicar os padrões visuais de maneira consistente em todo o sistema.

Se alguma informação necessária ao layout não existir no backend, não simular sua existência. Adaptar a interface aos dados reais e apontar separadamente a eventual necessidade de alteração funcional.

Sempre que houver dúvida sobre o comportamento atual de uma funcionalidade, inspecionar o código existente antes de decidir como modificá-la.

## 14. Ordem recomendada de execução

Aplicar o redesign de maneira incremental, para reduzir o risco de regressões.

**Etapa 1 — Base visual:** definir cores, tipografia, espaçamentos, bordas, sombras, botões, campos, tabelas e demais padrões reutilizáveis.

**Etapa 2 — Estrutura administrativa:** padronizar a navegação, os títulos, os cabeçalhos das páginas e a organização do conteúdo.

**Etapa 3 — Dashboard:** melhorar a hierarquia dos indicadores, o filtro mensal e a tabela que resume as casas.

**Etapa 4 — Avisos:** padronizar a listagem, a visualização dos registros e o formulário de criação e publicação.

**Etapa 5 — Casas:** melhorar a listagem geral, os filtros e a organização dos detalhes de cada casa.

**Etapa 6 — Moradores e pagamentos:** organizar o cadastro de moradores e a interface de consulta e baixa dos pagamentos, conforme as regras existentes.

**Etapa 7 — Área do morador:** criar uma experiência simples, com tela inicial sem menu e acesso direto aos avisos e pagamentos.

**Etapa 8 — Revisão:** testar permissões, formulários, filtros, navegação, feedbacks, responsividade e operações reais.

Essa ordem é uma orientação de execução. A IA pode ajustá-la de acordo com as dependências encontradas no projeto, desde que preserve as funcionalidades existentes.

## 15. Critérios de qualidade e resultado esperado

O redesign será considerado satisfatório quando:
- Todas as páginas apresentarem uma identidade visual consistente.
- O roxo funcionar como cor de destaque sem competir com os dados.
- Os cards forem utilizados de maneira seletiva e funcional.
- As tabelas permanecerem disponíveis nas situações em que facilitam a comparação de dados.
- A tela inicial do administrador oferecer uma visão mensal clara, com filtros funcionais.
- Os avisos puderem ser consultados e publicados por meio de uma interface organizada.
- As casas puderem ser localizadas e seus detalhes apresentados de maneira clara.
- O cadastro de moradores for intuitivo e respeitar os dados e relacionamentos existentes.
- A baixa de pagamentos apresentar confirmação, validação e feedback adequado.
- A área do morador permanecer simples e restrita às três telas previstas.
- A navegação respeitar as permissões de cada perfil.
- Não existirem informações duplicadas, indicadores sem utilidade ou componentes decorativos em excesso.
- O sistema continuar funcionando com os dados, as rotas e as regras reais do projeto.
- A interface puder ser utilizada em diferentes tamanhos de tela.

## 16. Diretriz final

Aplique uma linguagem visual moderna, limpa e profissional, combinando a organização dos dashboards administrativos, a clareza das tabelas, os indicadores compactos, os formulários em modais e os status visuais das referências fornecidas.

A prioridade deve ser a experiência de uso: facilitar a leitura, encontrar informações rapidamente e realizar operações com segurança.

**Não transforme o sistema inteiro em um dashboard de cards.** Utilize cards apenas para resumir ou destacar o que realmente merece atenção; tabelas para consultar e comparar registros; e seções simples para apresentar informações cadastrais.

O resultado deve parecer um único sistema de gerenciamento de condomínio, e não uma coleção de interfaces com estilos diferentes.

Antes de implementar qualquer mudança, considere a estrutura atual do código e preserve tudo o que já funciona. O redesign deve aprimorar a interface sem introduzir alterações desnecessárias na lógica de negócio.