s = open('components/cnp-consultation.tsx', encoding='utf-8').read()
i = s.find('if (status === "success")')
j = s.find('return (', i)
k = s.find('\n  }\n', j)
block = s[j:k]
print('open divs:', block.count('<div'))
print('close divs:', block.count('</div>'))
print('open paren:', block.count('('))
print('close paren:', block.count(')'))
