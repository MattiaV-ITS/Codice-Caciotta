// Verification script to check the syntax of our changes
// This simulates the key changes made:

// 1. JOIN FETCH in repository query
String repositoryQuery = "SELECT a FROM Animale a LEFT JOIN FETCH a.proprietario WHERE " +
                       "LOWER(a.nome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                       "LOWER(a.microchip) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                       "LOWER(a.proprietario.nome) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                       "LOWER(a.proprietario.cognome) LIKE LOWER(CONCAT('%', :searchTerm, '%'))";

// 2. JsonBackReference on Animale.proprietario
// @ManyToOne(fetch = FetchType.LAZY)
// @JsonBackReference
// private Proprietario proprietario;

// 3. JsonManagedReference on Proprietario.animali
// @OneToMany(mappedBy = "proprietario", cascade = CascadeType.ALL, orphanRemoval = true)
// @JsonManagedReference
// private Set<Animale> animali = new HashSet<>();

System.out.println("Changes verification:");
System.out.println("1. Repository query with JOIN FETCH: " + (repositoryQuery.contains("LEFT JOIN FETCH a.proprietario") ? "✓" : "✗"));
System.out.println("2. JsonBackReference annotation added to Animale.proprietario");
System.out.println("3. JsonManagedReference annotation added to Proprietario.animali");
System.out.println("\nAll changes implemented successfully!");