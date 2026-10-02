# Security Specification - El Cardal Gestão de Mesas

## 1. Data Invariants
- As mesas possuem IDs numéricos entre 1 e 53 (excluídas 13 e 24).
- A capacidade de cadeiras é um número entre 1 e 12.
- O campo `isOccupied` deve ser booleano.
- O campo `note` (anotação) é opcional e tem tamanho máximo de 500 caracteres.
- O campo `occupiedAt` é nulo ou timestamp numérico.
- O ID do documento na coleção `tables` deve ser numérico string correspondente ao ID da mesa.

## 2. Invariants & Payloads
- Rejeitar payloads com campos fantasmas não autorizados.
- Rejeitar notas maiores que 500 caracteres.
- Rejeitar IDs de mesas fora do intervalo válido.
- Rejeitar IDs de documentos malformados ou com injeção de caracteres.
