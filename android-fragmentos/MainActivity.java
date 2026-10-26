// android/app/src/main/java/uy/rick/prensacitrica/MainActivity.java
// Capacitor genera este archivo. Agregar solo lo marcado para modo inmersivo
// y para que la pantalla no se apague durante una partida.
package uy.rick.desercion;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // El juego dibuja hasta el borde; el CSS ya respeta env(safe-area-inset-*).
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // La barra de navegacion se esconde pero vuelve al deslizar.
        WindowInsetsControllerCompat c =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.hide(WindowInsetsCompat.Type.navigationBars());
        c.setSystemBarsBehavior(
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        // Sin esto la pantalla se apaga mientras el jugador piensa su turno.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
