p = 'components/admin-dashboard.tsx'
s = open(p, encoding='utf-8').read()

old1 = """                  <th>Titre foncier</th>
                  <th>CNP</th>
                  <th>E-mail</th>"""
new1 = """                  <th>Titre foncier</th>
                  <th>Notaire</th>
                  <th>CNP</th>
                  <th>E-mail</th>"""
assert old1 in s, "old1 not found"
s = s.replace(old1, new1)

old2 = """                    <td>{r.title_number}</td>
                    <td>{r.cnp_number || "—"}"""
new2 = """                    <td>{r.title_number}</td>
                    <td>{r.notaire_name || "—"}"""
assert old2 in s, "old2 not found"
s = s.replace(old2, new2, 1)

open(p, 'w', encoding='utf-8').write(s)
print("done")
